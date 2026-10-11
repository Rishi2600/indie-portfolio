import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  adjusting,
  ADJUST_SECONDS,
  AFTERGLOW_SECONDS,
  AFTERGLOW_STRENGTH,
  createAfterglow,
  createEmbers,
  createFlame,
  DARKNESS,
  darknessFor,
  FIRST_DARKNESS,
  inTheDark,
  reveal,
  STILL,
} from "./torch";

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

describe("afterglow", () => {
  it("lingers where the torch has been, and fades to nothing", () => {
    const glow = createAfterglow();
    glow.leave(100, 100, 300, 0);
    glow.leave(400, 100, 300, 0.1);
    const soon = glow.glowing(0.5);
    expect(soon).toHaveLength(2);
    expect(soon[0]!.alpha).toBeLessThanOrEqual(AFTERGLOW_STRENGTH);
    expect(glow.glowing(1.5)[0]!.alpha).toBeLessThan(soon[0]!.alpha);
    expect(glow.glowing(AFTERGLOW_SECONDS + 0.2)).toHaveLength(0);
  });

  it("never lifts the dark as far as the light itself does", () => {
    expect(AFTERGLOW_STRENGTH).toBeLessThan(0.5);
  });

  it("keeps a held torch's place glowing from the moment it leaves, not from when it arrived", () => {
    const glow = createAfterglow();
    for (let t = 0; t <= 10; t += 0.1) glow.leave(200, 200, 300, t);
    expect(glow.glowing(10)).toHaveLength(1);
    expect(glow.glowing(11)[0]!.alpha).toBeGreaterThan(0);
  });

  it("keeps a bounded number of marks however far the torch travels", () => {
    const glow = createAfterglow();
    for (let i = 0; i < 1000; i++) glow.leave(i * 100, 0, 300, i * 0.001);
    expect(glow.glowing(1).length).toBeLessThanOrEqual(48);
  });
});

describe("eyes adjusting", () => {
  it("starts darker than the cave and settles to it", () => {
    expect(DARKNESS + adjusting(0)).toBeCloseTo(FIRST_DARKNESS);
    expect(adjusting(ADJUST_SECONDS)).toBe(0);
    expect(adjusting(ADJUST_SECONDS * 3)).toBe(0);
  });

  it("only ever eases, never darkens again on the way", () => {
    let previous = adjusting(0);
    for (let t = 0.05; t <= ADJUST_SECONDS; t += 0.05) {
      const now = adjusting(t);
      expect(now).toBeLessThanOrEqual(previous + 1e-12);
      previous = now;
    }
  });

  it("is brief and modest", () => {
    expect(ADJUST_SECONDS).toBeLessThanOrEqual(5);
    expect(FIRST_DARKNESS).toBeLessThanOrEqual(0.72);
  });
});

describe("embers", () => {
  function fly(seconds: number, seed = 1) {
    const embers = createEmbers(seeded(seed));
    const frames: ReturnType<ReturnType<typeof createEmbers>["step"]>[] = [];
    for (let t = 0; t < seconds; t += 1 / 60) frames.push(embers.step(1 / 60, 500, 500));
    return frames;
  }

  it.each([1, 2, 3])("are rare: one every twelve to thirty-two seconds (seed %i)", (seed) => {
    const frames = fly(600, seed);
    let born = 0;
    for (let i = 1; i < frames.length; i++) if (frames[i]!.length > frames[i - 1]!.length) born++;
    expect(born).toBeGreaterThanOrEqual(600 / 32 - 2);
    expect(born).toBeLessThanOrEqual(600 / 12 + 2);
  });

  it("never fill the air: at most two at once", () => {
    for (const frame of fly(600)) expect(frame.length).toBeLessThanOrEqual(2);
  });

  it("rise from the flame and go out within about two seconds", () => {
    const embers = createEmbers(seeded(5));
    let first: { y: number } | undefined;
    let t = 0;
    for (; t < 60; t += 1 / 60) {
      const [spark] = embers.step(1 / 60, 500, 500);
      if (spark && !first) first = spark;
      if (first && !spark) break;
      if (spark && first) expect(spark.y).toBeLessThanOrEqual(first.y + 1);
    }
    expect(first).toBeDefined();
  });

  it("are tiny and never brighter than full", () => {
    for (const frame of fly(300)) {
      for (const e of frame) {
        expect(e.alpha).toBeGreaterThanOrEqual(0);
        expect(e.alpha).toBeLessThanOrEqual(1);
        expect(e.size).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe("finding a painting", () => {
  it("shows nothing beyond the light's edge", () => {
    expect(reveal(300, 300)).toBe(0);
    expect(reveal(5000, 300)).toBe(0);
  });

  it("shows it all close to the flame", () => {
    expect(reveal(0, 300)).toBe(1);
    expect(reveal(100, 300)).toBe(1);
  });

  it("comes up steadily as the light draws near", () => {
    let previous = 0;
    for (let d = 400; d >= 0; d -= 5) {
      const now = reveal(d, 300);
      expect(now).toBeGreaterThanOrEqual(previous);
      previous = now;
    }
  });
});
