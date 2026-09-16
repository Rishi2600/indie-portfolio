import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The route, driven the way a browser drives it, against an in-memory store.
 * These are the rules a visit is defined by, so they are tested at the
 * boundary rather than function by function.
 */

const store = vi.hoisted(() => ({ count: 0, down: false, increments: 0 }));

vi.mock("@/lib/visitors", () => ({
  getVisitorCounter: () => ({
    async increment() {
      if (store.down) throw new Error("store unreachable");
      store.increments += 1;
      return ++store.count;
    },
    async getCount() {
      if (store.down) throw new Error("store unreachable");
      return store.count;
    },
  }),
}));

const { GET, POST } = await import("./route");

let caller = 0;

type Options = {
  cookie?: string;
  site?: string;
  address?: string;
  body?: string;
};

function request(method: "GET" | "POST", options: Options = {}) {
  const headers = new Headers({
    // A distinct caller per request unless a test says otherwise, so the rate
    // limiter's memory never leaks from one test into the next.
    "x-forwarded-for": options.address ?? `client-${++caller}`,
  });
  if (options.cookie) headers.set("cookie", options.cookie);
  if (options.site) headers.set("sec-fetch-site", options.site);

  return new NextRequest("http://localhost/api/visits", {
    method,
    headers,
    body: options.body,
  });
}

beforeEach(() => {
  store.count = 100;
  store.down = false;
  store.increments = 0;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("a first visit", () => {
  it("is counted once and returns the new total", async () => {
    const response = await POST(request("POST", { site: "same-origin" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 101 });
    expect(store.increments).toBe(1);
  });

  it("leaves a cookie that marks the reader as counted, and nothing else", async () => {
    const response = await POST(request("POST"));
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(cookie).toMatch(/^visit=1;/);
    expect(cookie).toMatch(/;\s*HttpOnly/i);
    expect(cookie).toMatch(/;\s*SameSite=lax/i);
    expect(cookie).toMatch(/;\s*Path=\//i);
    // The visit window: one reader, counted at most once every twelve hours.
    expect(cookie).toMatch(/;\s*Max-Age=43200/i);
    // The value carries no identifier, timestamp or anything joinable.
    expect(cookie.split(";")[0]).toBe("visit=1");
  });

  it("is not marked Secure outside production, where localhost is plain http", async () => {
    const response = await POST(request("POST"));
    expect(response.headers.get("set-cookie")).not.toMatch(/Secure/i);
  });

  it("is marked Secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const production = await import("./route");

    const response = await production.POST(request("POST"));
    expect(response.headers.get("set-cookie")).toMatch(/;\s*Secure/i);
  });

  it("is counted when the browser sends no Sec-Fetch-Site at all", async () => {
    const response = await POST(request("POST"));
    expect(response.status).toBe(200);
    expect(store.increments).toBe(1);
  });
});

describe("a returning reader", () => {
  it("is shown the total without being counted again", async () => {
    const response = await POST(request("POST", { cookie: "visit=1" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 100 });
    expect(store.increments).toBe(0);
  });

  it("is not given a new cookie, so the window is not extended by refreshing", async () => {
    const response = await POST(request("POST", { cookie: "visit=1" }));
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("counts once across a first request and its refreshes", async () => {
    const address = "reader-who-refreshes";
    const first = await POST(request("POST", { address }));
    const cookie = (first.headers.get("set-cookie") ?? "").split(";")[0];

    for (let i = 0; i < 5; i++) {
      await POST(request("POST", { address, cookie }));
    }

    expect(store.increments).toBe(1);
    expect(store.count).toBe(101);
  });
});

describe("the count cannot be set by the client", () => {
  it("ignores a count sent in the body", async () => {
    const response = await POST(
      request("POST", { body: JSON.stringify({ count: 1_000_000 }) }),
    );
    expect(await response.json()).toEqual({ count: 101 });
  });

  it("does not treat an unrelated cookie as having been counted", async () => {
    await POST(request("POST", { cookie: "visited=1; theme=dark" }));
    expect(store.increments).toBe(1);
  });
});

describe("reading", () => {
  it("GET reports the total and never records a visit", async () => {
    for (let i = 0; i < 3; i++) {
      const response = await GET(request("GET"));
      expect(await response.json()).toEqual({ count: 100 });
      expect(response.headers.get("set-cookie")).toBeNull();
    }
    expect(store.increments).toBe(0);
  });
});

describe("requests from other sites", () => {
  it("are refused and not counted", async () => {
    const response = await POST(request("POST", { site: "cross-site" }));

    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(store.increments).toBe(0);
  });

  it.each(["same-origin", "same-site", "none"])(
    "are allowed when Sec-Fetch-Site is %s",
    async (site) => {
      const response = await POST(request("POST", { site }));
      expect(response.status).toBe(200);
    },
  );
});

describe("rate limiting", () => {
  it("refuses a caller after twelve requests a minute, without counting", async () => {
    const address = "busy-caller";
    const statuses: number[] = [];
    for (let i = 0; i < 13; i++) {
      const response = await POST(
        request("POST", { address, cookie: "visit=1" }),
      );
      statuses.push(response.status);
    }

    expect(statuses.slice(0, 12).every((s) => s === 200)).toBe(true);
    expect(statuses[12]).toBe(429);
  });

  it("applies to reads as well as visits", async () => {
    const address = "busy-reader";
    let last = 0;
    for (let i = 0; i < 13; i++) {
      last = (await GET(request("GET", { address }))).status;
    }
    expect(last).toBe(429);
  });

  it("does not hold one caller's requests against another", async () => {
    for (let i = 0; i < 13; i++) {
      await POST(request("POST", { address: "noisy", cookie: "visit=1" }));
    }
    const response = await POST(request("POST", { address: "quiet" }));
    expect(response.status).toBe(200);
  });
});

describe("when the store is down", () => {
  it("answers 503 and sets no cookie, so the reader is counted later", async () => {
    store.down = true;
    const address = "unlucky-reader";

    const failed = await POST(request("POST", { address }));
    expect(failed.status).toBe(503);
    expect(await failed.json()).toEqual({ error: "unavailable" });
    expect(failed.headers.get("set-cookie")).toBeNull();

    store.down = false;
    const retried = await POST(request("POST", { address }));
    expect(retried.status).toBe(200);
    expect(store.increments).toBe(1);
  });

  it("answers 503 to reads too", async () => {
    store.down = true;
    expect((await GET(request("GET"))).status).toBe(503);
  });

  it("does not leak the store's error to the reader", async () => {
    store.down = true;
    const body = await (await POST(request("POST"))).text();
    expect(body).not.toContain("unreachable");
  });
});

describe("caching", () => {
  it.each([
    ["a counted visit", () => POST(request("POST"))],
    ["a returning reader", () => POST(request("POST", { cookie: "visit=1" }))],
    ["a read", () => GET(request("GET"))],
    ["a refusal", () => POST(request("POST", { site: "cross-site" }))],
  ])("%s is never cacheable", async (_, send) => {
    const response = await send();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
