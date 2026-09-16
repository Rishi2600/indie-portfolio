import { describe, expect, it, vi } from "vitest";
import { createRedisCounter } from "./redis";

type Reply = { status?: number; body: unknown };

/** A stand-in for the Upstash REST endpoint that records what it was asked. */
function fakeRedis(...replies: Reply[]) {
  const fetch = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => {
    const reply = replies.shift() ?? { body: { result: null } };
    return new Response(JSON.stringify(reply.body), {
      status: reply.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const URL_ = "https://example.upstash.io";
const TOKEN = "test-token";

describe("redis counter", () => {
  it("increments with INCR and returns the new total", async () => {
    const fetch = fakeRedis({ body: { result: 7 } });
    const counter = createRedisCounter(URL_, TOKEN, "portfolio:visits");

    await expect(counter.increment()).resolves.toBe(7);

    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe(`${URL_}/incr/portfolio%3Avisits`);
    expect(new Headers(init?.headers).get("authorization")).toBe(
      `Bearer ${TOKEN}`,
    );
    expect(init?.cache).toBe("no-store");
  });

  it("reads with GET, and never with INCR", async () => {
    const fetch = fakeRedis({ body: { result: "7" } });
    const counter = createRedisCounter(URL_, TOKEN, "visits");

    await expect(counter.getCount()).resolves.toBe(7);
    expect(fetch.mock.calls[0]![0]).toBe(`${URL_}/get/visits`);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("reads a key that has never been set as zero", async () => {
    fakeRedis({ body: { result: null } });
    await expect(
      createRedisCounter(URL_, TOKEN, "visits").getCount(),
    ).resolves.toBe(0);
  });

  it("tolerates a trailing slash on the configured URL", async () => {
    const fetch = fakeRedis({ body: { result: 1 } });
    await createRedisCounter(`${URL_}//`, TOKEN, "visits").increment();
    expect(fetch.mock.calls[0]![0]).toBe(`${URL_}/incr/visits`);
  });

  it("keeps the key inside its path segment", async () => {
    const fetch = fakeRedis({ body: { result: 1 } });
    await createRedisCounter(URL_, TOKEN, "a/b?c").increment();
    expect(fetch.mock.calls[0]![0]).toBe(`${URL_}/incr/a%2Fb%3Fc`);
  });

  it("fails on an HTTP error rather than reporting a number", async () => {
    fakeRedis({ status: 401, body: { error: "unauthorized" } });
    await expect(
      createRedisCounter(URL_, TOKEN, "visits").increment(),
    ).rejects.toThrow(/401/);
  });

  it("fails when Redis reports an error in the body", async () => {
    fakeRedis({ body: { error: "WRONGTYPE Operation against a key" } });
    await expect(
      createRedisCounter(URL_, TOKEN, "visits").increment(),
    ).rejects.toThrow(/WRONGTYPE/);
  });

  it("fails when the key holds something that is not a count", async () => {
    fakeRedis({ body: { result: "hello" } });
    await expect(
      createRedisCounter(URL_, TOKEN, "visits").getCount(),
    ).rejects.toThrow(/not numeric/);
  });

  it("fails on a response that is not a Redis reply at all", async () => {
    fakeRedis({ body: "<html>gateway error</html>" });
    await expect(
      createRedisCounter(URL_, TOKEN, "visits").increment(),
    ).rejects.toThrow(/malformed/);
  });

  it("gives up on a store that does not answer", async () => {
    // AbortSignal.timeout runs on Node's internal clock, which fake timers do
    // not reach, so the timeout is intercepted and fired by hand instead.
    const controller = new AbortController();
    const timeout = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(controller.signal);

    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(init.signal!.reason),
            );
          }),
      ),
    );

    const pending = createRedisCounter(URL_, TOKEN, "visits").increment();
    controller.abort(new DOMException("timed out", "TimeoutError"));

    await expect(pending).rejects.toThrow(/timed out/);
    expect(timeout).toHaveBeenCalledWith(2500);
  });
});
