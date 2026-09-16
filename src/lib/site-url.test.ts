import { describe, expect, it } from "vitest";
import {
  deploymentOf,
  isIndexable,
  normaliseSiteUrl,
  resolveSiteUrl,
} from "./site-url";

describe("resolveSiteUrl", () => {
  it("uses the configured origin wherever it is set", () => {
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://rishi.example" }),
    ).toBe("https://rishi.example");
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://rishi.example",
        VERCEL_ENV: "preview",
        VERCEL_URL: "preview-abc.vercel.app",
      }),
    ).toBe("https://rishi.example");
  });

  it("drops a trailing slash, which would double every path", () => {
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://rishi.example/" }),
    ).toBe("https://rishi.example");
  });

  it("refuses to build production without one", () => {
    expect(() => resolveSiteUrl({ VERCEL_ENV: "production" })).toThrow(
      /NEXT_PUBLIC_SITE_URL is required/,
    );
    // Not even when Vercel could supply a generated address.
    expect(() =>
      resolveSiteUrl({
        VERCEL_ENV: "production",
        VERCEL_URL: "indie-portfolio-abc123.vercel.app",
      }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL is required/);
  });

  it("treats a blank value as missing", () => {
    expect(() =>
      resolveSiteUrl({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "  " }),
    ).toThrow(/is required/);
  });

  it("requires https in production", () => {
    expect(() =>
      resolveSiteUrl({
        VERCEL_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "http://rishi.example",
      }),
    ).toThrow(/https/);
  });

  it("gives a preview deployment its own address", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "indie-portfolio-git-branch.vercel.app",
      }),
    ).toBe("https://indie-portfolio-git-branch.vercel.app");
  });

  it("falls back to localhost on a developer's machine", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });
});

describe("normaliseSiteUrl", () => {
  it.each([
    ["not a URL", "rishi.example"],
    ["a path", "https://rishi.example/portfolio"],
    ["a query", "https://rishi.example/?ref=x"],
    ["a fragment", "https://rishi.example/#top"],
    ["credentials", "https://user@rishi.example"],
    ["another scheme", "ftp://rishi.example"],
  ])("refuses %s", (_, value) => {
    expect(() => normaliseSiteUrl(value)).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("keeps a port, since it is part of the origin", () => {
    expect(normaliseSiteUrl("http://localhost:4000")).toBe(
      "http://localhost:4000",
    );
  });
});

describe("deployments and indexing", () => {
  it("recognises Vercel's three environments and nothing else", () => {
    expect(deploymentOf({ VERCEL_ENV: "production" })).toBe("production");
    expect(deploymentOf({ VERCEL_ENV: "preview" })).toBe("preview");
    expect(deploymentOf({ VERCEL_ENV: "development" })).toBe("development");
    expect(deploymentOf({ VERCEL_ENV: "staging" })).toBe("other");
    expect(deploymentOf({})).toBe("other");
  });

  it("keeps preview and development deployments out of search engines", () => {
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true);
    expect(isIndexable({})).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isIndexable({ VERCEL_ENV: "development" })).toBe(false);
  });
});
