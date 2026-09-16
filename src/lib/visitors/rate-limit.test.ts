import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { allow, fingerprint } from "./rate-limit";

/** The module keeps its windows for the life of the process, so every test
 *  uses callers no other test has used. */
let caller = 0;
const nextCaller = () => `caller-${++caller}`;

const LIMIT = 12;
const WINDOW_MS = 60_000;

describe("rate limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it(`allows ${LIMIT} requests in a window and refuses the next`, () => {
    const key = nextCaller();
    const results = Array.from({ length: LIMIT + 3 }, () => allow(key));

    expect(results.slice(0, LIMIT)).toEqual(Array(LIMIT).fill(true));
    expect(results.slice(LIMIT)).toEqual([false, false, false]);
  });

  it("keeps refusing until the window has fully passed", () => {
    const key = nextCaller();
    for (let i = 0; i < LIMIT; i++) allow(key);

    vi.advanceTimersByTime(WINDOW_MS - 1);
    expect(allow(key)).toBe(false);
  });

  it("opens a fresh window once the old one has expired", () => {
    const key = nextCaller();
    for (let i = 0; i < LIMIT + 5; i++) allow(key);

    vi.advanceTimersByTime(WINDOW_MS);

    const results = Array.from({ length: LIMIT + 1 }, () => allow(key));
    expect(results.filter(Boolean)).toHaveLength(LIMIT);
    expect(results.at(-1)).toBe(false);
  });

  it("is a fixed window, not a sliding one: it does not extend on use", () => {
    const key = nextCaller();
    allow(key);
    vi.advanceTimersByTime(WINDOW_MS / 2);
    for (let i = 0; i < LIMIT - 1; i++) allow(key);
    expect(allow(key)).toBe(false);

    // Measured from the first request, not the latest.
    vi.advanceTimersByTime(WINDOW_MS / 2);
    expect(allow(key)).toBe(true);
  });

  it("gives every caller their own allowance", () => {
    const noisy = nextCaller();
    const quiet = nextCaller();
    for (let i = 0; i < LIMIT * 2; i++) allow(noisy);

    expect(allow(noisy)).toBe(false);
    expect(allow(quiet)).toBe(true);
  });

  it("keeps working after many callers have come and gone", () => {
    // Enough distinct callers to trigger the sweep of expired windows.
    for (let i = 0; i < 1500; i++) allow(nextCaller());
    vi.advanceTimersByTime(WINDOW_MS);

    const key = nextCaller();
    const results = Array.from({ length: LIMIT + 1 }, () => allow(key));
    expect(results.filter(Boolean)).toHaveLength(LIMIT);
  });
});

describe("fingerprint", () => {
  const request = (headers: Record<string, string>) =>
    new Request("http://localhost/api/visits", { headers });

  it("is stable for the same address", () => {
    const a = fingerprint(request({ "x-forwarded-for": "203.0.113.7" }));
    const b = fingerprint(request({ "x-forwarded-for": "203.0.113.7" }));
    expect(a).toBe(b);
  });

  it("differs between addresses", () => {
    const a = fingerprint(request({ "x-forwarded-for": "203.0.113.7" }));
    const b = fingerprint(request({ "x-forwarded-for": "203.0.113.8" }));
    expect(a).not.toBe(b);
  });

  it("uses the client end of a proxy chain, not the last proxy", () => {
    const direct = fingerprint(request({ "x-forwarded-for": "203.0.113.7" }));
    const proxied = fingerprint(
      request({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" }),
    );
    expect(proxied).toBe(direct);
  });

  it("falls back to x-real-ip when there is no forwarding header", () => {
    const forwarded = fingerprint(request({ "x-forwarded-for": "198.51.100.4" }));
    const real = fingerprint(request({ "x-real-ip": "198.51.100.4" }));
    expect(real).toBe(forwarded);
  });

  it("never contains the address, in any form", () => {
    const address = "203.0.113.7";
    const value = fingerprint(request({ "x-forwarded-for": address }));

    expect(value).not.toContain(address);
    expect(value).not.toContain(Buffer.from(address).toString("base64url"));
    expect(value).not.toContain(Buffer.from(address).toString("hex"));
  });

  it("is salted: it is not the plain SHA-256 of the address", async () => {
    const { createHash } = await import("node:crypto");
    const address = "203.0.113.7";
    const unsalted = createHash("sha256")
      .update(address)
      .digest("base64url")
      .slice(0, 22);

    expect(fingerprint(request({ "x-forwarded-for": address }))).not.toBe(
      unsalted,
    );
  });

  it("is short and URL-safe", () => {
    const value = fingerprint(request({ "x-forwarded-for": "203.0.113.7" }));
    expect(value).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });
});
