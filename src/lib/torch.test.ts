import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createFlame, DARKNESS, darknessFor, inTheDark, STILL } from "./torch";

/** A repeatable stand-in for Math.random. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

/** The night values from tokens.css. */
const css = readFileSync(join(__dirname, "..", "styles", "tokens.css"), "utf8");
const night = css.slice(css.indexOf(':root[data-theme="night"] {'));
const token = (name: string) => new RegExp(`${name}:\\s*(#[0-9a-f]{6});`).exec(night)![1]!;

describe("the cave", () => {
  it("is dark: the unlit ground is all but black", () => {
    expect(luminance(inTheDark(token("--paper")))).toBeLessThan(0.01);
  });

  it("never loses the writing: unlit prose stays at 3:1 or better", () => {
    expect(contrast(inTheDark(token("--ink")), inTheDark(token("--paper")))).toBeGreaterThanOrEqual(3);
  });

  it("still keeps it in shadow: unlit prose is well below its contrast in the light", () => {
    const unlit = contrast(inTheDark(token("--ink")), inTheDark(token("--paper")));
    const lit = contrast(token("--ink"), token("--paper"));
    expect(lit / unlit).toBeGreaterThan(3);
  });

  it("darkens by a fixed, modest amount", () => {
    expect(DARKNESS).toBeGreaterThan(0.4);
    expect(DARKNESS).toBeLessThan(0.65);
  });
});

describe("the flame", () => {
  function burn(seconds: number, seed = 1, dt = 1 / 60) {
    const flame = createFlame(seeded(seed));
    return Array.from({ length: Math.round(seconds / dt) }, () => flame.step(dt));
  }

  it("is never still: its reach and strength keep changing", () => {
    const states = burn(10);
    const reaches = new Set(states.map((s) => s.reach.toFixed(4)));
    expect(reaches.size).toBeGreaterThan(300);
  });

  const SEEDS = [1, 2, 3, 4, 5];

  it.each(SEEDS)("stays a steady light overall (seed %i): always within a few percent of full", (seed) => {
    for (const s of burn(300, seed)) {
      expect(s.reach).toBeGreaterThanOrEqual(0.84);
      expect(s.reach).toBeLessThanOrEqual(1.12);
      expect(s.strength).toBeGreaterThanOrEqual(0.72);
      expect(s.strength).toBeLessThanOrEqual(1.04);
      for (const lick of s.licks) expect(Math.abs(lick)).toBeLessThanOrEqual(0.12);
    }
  });

  it.each(SEEDS)("flickers, but never leaps from one frame to the next (seed %i)", (seed) => {
    const states = burn(300, seed);
    for (let i = 1; i < states.length; i++) {
      expect(Math.abs(states[i]!.strength - states[i - 1]!.strength)).toBeLessThan(0.12);
      expect(Math.abs(states[i]!.reach - states[i - 1]!.reach)).toBeLessThan(0.06);
    }
  });

  it.each(SEEDS)("can never flash: a lit block of writing changes far less than WCAG's flash threshold (seed %i)", (seed) => {
    // WCAG 2.3.1 counts a flash as a change of 10% of the maximum luminance
    // over a sizeable area. Take a block of text under the light (a fifth
    // ink, the rest stone) and the darkness left at the heart of the light,
    // which is the most the flame can change there, frame by frame.
    const ink = token("--ink");
    const paper = token("--paper");
    const block = (strength: number) => {
      const left = darknessFor(strength) * (1 - Math.min(1, strength));
      return 0.2 * luminance(inTheDark(ink, left)) + 0.8 * luminance(inTheDark(paper, left));
    };
    const states = burn(300, seed);
    let worst = 0;
    for (let i = 1; i < states.length; i++) {
      worst = Math.max(worst, Math.abs(block(states[i]!.strength) - block(states[i - 1]!.strength)));
    }
    expect(worst).toBeLessThan(0.02);
  });

  it("is caught by a draught now and then, not constantly", () => {
    // The flicker alone never takes the light below about 0.9; a draught does.
    const states = burn(120);
    let dips = 0;
    let dipping = false;
    for (const s of states) {
      if (!dipping && s.strength < 0.86) {
        dips++;
        dipping = true;
      } else if (dipping && s.strength > 0.94) {
        dipping = false;
      }
    }
    // every three to nine seconds: about 13 to 40 in two minutes
    expect(dips).toBeGreaterThanOrEqual(10);
    expect(dips).toBeLessThanOrEqual(45);
  });

  it("rises rather than sinks: the light's heart drifts up, as a flame does", () => {
    const states = burn(30);
    const mean = states.reduce((sum, s) => sum + s.dy, 0) / states.length;
    expect(mean).toBeLessThan(0);
  });

  it("copes with a stalled frame without leaping", () => {
    const flame = createFlame(seeded(3));
    flame.step(1 / 60);
    const a = flame.step(1 / 60);
    const b = flame.step(5); // a tab returning after five seconds
    expect(Math.abs(b.strength - a.strength)).toBeLessThan(0.2);
  });

  it("licks unevenly: its tongues flicker apart from one another", () => {
    const states = burn(5);
    const apart = states.filter((s) => Math.max(...s.licks) - Math.min(...s.licks) > 0.04).length;
    expect(apart / states.length).toBeGreaterThan(0.5);
  });

  it("has a still state for readers who ask for less motion", () => {
    expect(STILL).toMatchObject({ reach: 1, strength: 1, dx: 0, dy: 0 });
    expect(STILL.licks.every((l) => l === 0)).toBe(true);
  });
});
