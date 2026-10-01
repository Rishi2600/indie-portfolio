import { afterEach, describe, expect, it, vi } from "vitest";
import { choiceToStore, resolveTheme, themeScript, type Theme } from "./theme";

describe("resolveTheme", () => {
  it("follows the system until the reader has chosen", () => {
    expect(resolveTheme(null, true)).toBe("night");
    expect(resolveTheme(null, false)).toBe("day");
  });

  it("keeps a reader's choice whatever the system says", () => {
    expect(resolveTheme("day", true)).toBe("day");
    expect(resolveTheme("night", false)).toBe("night");
  });

  it("ignores anything stored that is not a theme", () => {
    expect(resolveTheme("dark", true)).toBe("night");
    expect(resolveTheme("", false)).toBe("day");
  });
});

describe("choiceToStore", () => {
  it("stores a choice that differs from the system", () => {
    expect(choiceToStore("night", false)).toBe("night");
    expect(choiceToStore("day", true)).toBe("day");
  });

  it("stores nothing when the choice is what the system would give, so the reader follows it again", () => {
    expect(choiceToStore("night", true)).toBeNull();
    expect(choiceToStore("day", false)).toBeNull();
  });
});

describe("the script in <head>", () => {
  afterEach(() => vi.unstubAllGlobals());

  /** Runs the real script string against a stubbed browser; returns the theme it set. */
  function run({ stored, dark, storage = "works", matchMedia = true }: {
    stored: string | null;
    dark: boolean;
    storage?: "works" | "throws";
    matchMedia?: boolean;
  }): string | null {
    let set: string | null = null;
    const media = matchMedia ? () => ({ matches: dark }) : undefined;
    vi.stubGlobal("window", { matchMedia: media });
    vi.stubGlobal("localStorage", {
      getItem: () => {
        if (storage === "throws") throw new Error("SecurityError");
        return stored;
      },
    });
    vi.stubGlobal("document", {
      documentElement: { setAttribute: (name: string, value: string) => { if (name === "data-theme") set = value; } },
    });
    new Function(themeScript)();
    return set;
  }

  const cases: [string | null, boolean][] = [
    [null, false], [null, true],
    ["day", false], ["day", true],
    ["night", false], ["night", true],
    ["nonsense", true], ["nonsense", false],
  ];

  it.each(cases)("stored %j, system dark %j: agrees with resolveTheme", (stored, dark) => {
    expect(run({ stored, dark })).toBe(resolveTheme(stored, dark));
  });

  it("falls back to the system when storage cannot be read", () => {
    expect(run({ stored: "day", dark: true, storage: "throws" })).toBe<Theme>("night");
  });

  it("falls back to day in a browser without matchMedia", () => {
    expect(run({ stored: null, dark: true, matchMedia: false })).toBe<Theme>("day");
  });

  it("is plain enough for any browser: no arrow functions, let, const or template literals", () => {
    expect(themeScript).not.toMatch(/=>|\blet\b|\bconst\b|`/);
  });
});
