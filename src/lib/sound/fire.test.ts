import { describe, expect, it } from "vitest";
import { soundOf } from "./fire";

describe("the fire's sound", () => {
  it("is silent once the torch is out", () => {
    expect(soundOf("out", 1)).toMatchObject({ roar: 0, hiss: 0, rate: 0 });
  });

  it("roars louder the stronger the flame", () => {
    expect(soundOf("burning", 1).roar).toBeGreaterThan(soundOf("burning", 0.7).roar);
  });

  it("sputters more as it dies, and crackles most as it catches", () => {
    expect(soundOf("dying", 0.8).rate).toBeGreaterThan(soundOf("burning", 1).rate);
    expect(soundOf("catching", 0.5).rate).toBeGreaterThan(soundOf("dying", 0.8).rate);
  });

  it("is quiet: a background, never louder than the page's own sounds would be", () => {
    for (const phase of ["burning", "dying", "catching"] as const) {
      const s = soundOf(phase, 1.04);
      expect(s.roar).toBeLessThanOrEqual(0.05);
      expect(s.crack * 2.2).toBeLessThan(0.7);
    }
  });
});
