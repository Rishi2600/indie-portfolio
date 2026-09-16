import { describe, expect, it } from "vitest";
import { parseCount } from "./types";

describe("parseCount", () => {
  it("reads an unset key as a counter that has never been incremented", () => {
    expect(parseCount(null)).toBe(0);
    expect(parseCount(undefined)).toBe(0);
  });

  it("accepts what Redis actually sends back", () => {
    expect(parseCount(42)).toBe(42); // INCR
    expect(parseCount("42")).toBe(42); // GET
    expect(parseCount(0)).toBe(0);
    expect(parseCount("0")).toBe(0);
  });

  it("refuses a string that is only partly a number", () => {
    // parseInt would read these as 12 and 3 and carry on.
    expect(() => parseCount("12abc")).toThrow(/not numeric/);
    expect(() => parseCount("3.5")).toThrow(/not numeric/);
    expect(() => parseCount(" 7")).toThrow(/not numeric/);
    expect(() => parseCount("")).toThrow(/not numeric/);
  });

  it("refuses counts that cannot be a number of visits", () => {
    expect(() => parseCount(-1)).toThrow(/non-negative integer/);
    expect(() => parseCount("-1")).toThrow(/not numeric/);
    expect(() => parseCount(1.5)).toThrow(/non-negative integer/);
    expect(() => parseCount(Number.NaN)).toThrow(/non-negative integer/);
    expect(() => parseCount(Number.POSITIVE_INFINITY)).toThrow(
      /non-negative integer/,
    );
  });

  it("refuses a count too large to represent exactly", () => {
    expect(() => parseCount("9007199254740993")).toThrow(/not numeric/);
    expect(() => parseCount(2 ** 53)).toThrow(/non-negative integer/);
  });

  it("refuses values of the wrong type", () => {
    expect(() => parseCount({ count: 1 })).toThrow(/unexpected type: object/);
    expect(() => parseCount(true)).toThrow(/unexpected type: boolean/);
  });

  it("does not echo an unbounded amount of a corrupt value into the error", () => {
    const junk = "x".repeat(10_000);
    try {
      parseCount(junk);
      expect.unreachable();
    } catch (error) {
      expect((error as Error).message.length).toBeLessThan(80);
    }
  });
});
