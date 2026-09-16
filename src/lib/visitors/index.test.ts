import { beforeEach, describe, expect, it, vi } from "vitest";
import { selectBackend } from "./index";

describe("selectBackend", () => {
  it("uses Redis under Upstash's own variable names", () => {
    expect(
      selectBackend({
        UPSTASH_REDIS_REST_URL: "https://a.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "t",
      }),
    ).toEqual({
      kind: "redis",
      url: "https://a.upstash.io",
      token: "t",
      key: "portfolio:visits",
    });
  });

  it("uses Redis under the names Vercel's integration injects", () => {
    expect(
      selectBackend({
        VERCEL: "1",
        KV_REST_API_URL: "https://b.upstash.io",
        KV_REST_API_TOKEN: "k",
      }),
    ).toMatchObject({ kind: "redis", url: "https://b.upstash.io", token: "k" });
  });

  it("prefers Upstash's names when both are present", () => {
    expect(
      selectBackend({
        UPSTASH_REDIS_REST_URL: "https://upstash",
        UPSTASH_REDIS_REST_TOKEN: "u",
        KV_REST_API_URL: "https://kv",
        KV_REST_API_TOKEN: "k",
      }),
    ).toMatchObject({ url: "https://upstash", token: "u" });
  });

  it("honours a custom key, so one database can hold several counters", () => {
    expect(
      selectBackend({
        KV_REST_API_URL: "https://kv",
        KV_REST_API_TOKEN: "k",
        VISITOR_COUNTER_KEY: "staging:visits",
      }),
    ).toMatchObject({ key: "staging:visits" });
  });

  it("treats blank values as unset", () => {
    expect(
      selectBackend({
        UPSTASH_REDIS_REST_URL: "  ",
        UPSTASH_REDIS_REST_TOKEN: "",
        VISITOR_COUNTER_KEY: " ",
        NODE_ENV: "development",
      }),
    ).toMatchObject({ kind: "file" });
  });

  it("does not count on a Vercel function's disk", () => {
    const backend = selectBackend({ VERCEL: "1", NODE_ENV: "production" });
    expect(backend.kind).toBe("unavailable");
    expect(backend).toMatchObject({ reason: expect.stringContaining("KV_REST_API_URL") });
  });

  it("names the missing half of a half-configured credential", () => {
    const backend = selectBackend({
      VERCEL: "1",
      KV_REST_API_URL: "https://kv",
    });
    expect(backend).toMatchObject({
      kind: "unavailable",
      reason: expect.stringContaining("Only the URL is set"),
    });
  });

  it("uses the file quietly in development", () => {
    expect(selectBackend({ NODE_ENV: "development" }, "/repo")).toEqual({
      kind: "file",
      path: "/repo/.data/visits.json",
      warning: undefined,
    });
  });

  it("uses the file in a self-hosted production build, and says what that costs", () => {
    const backend = selectBackend({ NODE_ENV: "production" });
    expect(backend).toMatchObject({
      kind: "file",
      warning: expect.stringContaining("more than one instance"),
    });
  });
});

describe("getVisitorCounter on Vercel without Redis", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("warns once and fails every call, so the page shows a dash", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("KV_REST_API_TOKEN", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getVisitorCounter } = await import("./index");
    const counter = getVisitorCounter();

    await expect(counter.increment()).rejects.toThrow(/No Redis credentials/);
    await expect(getVisitorCounter().getCount()).rejects.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
