import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BURN_MAX,
  BURN_MIN,
  CATCH_SECONDS,
  createFuel,
  createSmoke,
  darknessOf,
  DYING_SECONDS,
  LIT,
  OUT_DARKNESS,
  type Fire,
} from "./fuel";
import { createFlame, darknessFor, inTheDark } from "./torch";

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

const css = readFileSync(join(__dirname, "..", "styles", "tokens.css"), "utf8");
const night = css.slice(css.indexOf(':root[data-theme="night"] {'));
const token = (name: string) => new RegExp(`${name}:\\s*(#[0-9a-f]{6});`).exec(night)![1]!;

const DT = 1 / 60;

/** Burns a torch for `seconds`, returning every frame. */
function burn(seconds: number, seed = 1, fuel = createFuel(seeded(seed))) {
  return Array.from({ length: Math.round(seconds / DT) }, () => fuel.step(DT));
}

describe("a burning torch", () => {
  it.each([1, 2, 3])("is exactly the flame it always was until it starts to go (seed %i)", (seed) => {
    for (const fire of burn(BURN_MIN - 1, seed)) expect(fire).toEqual(LIT);
  });

  it.each([1, 2, 3, 4, 5])("burns for three to five minutes, then gutters (seed %i)", (seed) => {
    const frames = burn(BURN_MAX + 1, seed);
    const start = frames.findIndex((f) => f.phase === "dying") * DT;
    expect(start).toBeGreaterThanOrEqual(BURN_MIN - 0.1);
    expect(start).toBeLessThanOrEqual(BURN_MAX + 0.1);
  });

  it("leaves the cave's darkness exactly as the flame sets it", () => {
    for (let d = 0.5; d <= 0.72; d += 0.01) expect(darknessOf(d, LIT)).toBe(d);
  });
});

describe("a dying torch", () => {
  const frames = burn(BURN_MAX + DYING_SECONDS + 10);
  const dying = frames.filter((f) => f.phase === "dying");

  it("gives about twenty seconds' warning before it goes out", () => {
    expect(dying.length * DT).toBeCloseTo(DYING_SECONDS, 0);
  });

  it("shrinks and cools as it goes", () => {
    const early = dying.slice(0, 60);
    const late = dying.slice(-300, -120);
    const mean = (fs: Fire[], k: "reach" | "cool") => fs.reduce((s, f) => s + f[k], 0) / fs.length;
    expect(mean(late, "reach")).toBeLessThan(mean(early, "reach") * 0.7);
    expect(mean(late, "cool")).toBeGreaterThan(mean(early, "cool"));
  });

  it("ends out, with its head glowing for a moment and then cold", () => {
    const out = frames.filter((f) => f.phase === "out");
    expect(out[0]!.coal).toBeGreaterThan(0.5);
    expect(out.at(-1)!.coal).toBeLessThan(0.01);
    for (const f of out) expect(f.reach).toBe(0);
  });

  it.each([1, 2, 3, 4, 5])("never leaps from one frame to the next (seed %i)", (seed) => {
    const all = burn(BURN_MAX + DYING_SECONDS + 2, seed).filter((f) => f.phase !== "burning");
    for (let i = 1; i < all.length; i++) {
      expect(Math.abs(all[i]!.reach - all[i - 1]!.reach)).toBeLessThan(0.06);
      expect(Math.abs(all[i]!.strength - all[i - 1]!.strength)).toBeLessThan(0.12);
      expect(Math.abs(all[i]!.cap - all[i - 1]!.cap)).toBeLessThan(0.01);
    }
  });
});

describe("the dark with the torch out", () => {
  it("never loses the writing: unlit prose stays at 3:1", () => {
    const ink = inTheDark(token("--ink"), OUT_DARKNESS);
    const paper = inTheDark(token("--paper"), OUT_DARKNESS);
    expect(contrast(ink, paper)).toBeGreaterThanOrEqual(3);
  });

  it("is darker than the cave away from a burning torch", () => {
    expect(OUT_DARKNESS).toBeGreaterThan(darknessFor(1));
  });
});

describe("catching again", () => {
  function goOut(seed = 1) {
    const fuel = createFuel(seeded(seed));
    burn(BURN_MAX + DYING_SECONDS + 1, seed, fuel);
    return fuel;
  }

  it("catches from the embers and settles back to exactly the flame it was", () => {
    const fuel = goOut();
    fuel.relight();
    const frames = burn(CATCH_SECONDS + 0.1, 1, fuel);
    expect(frames[0]!.phase).toBe("catching");
    expect(Math.max(...frames.map((f) => f.reach))).toBeGreaterThan(1);
    expect(frames.at(-1)).toEqual(LIT);
  });

  it("burns a full torch's length again once caught", () => {
    const fuel = goOut();
    fuel.relight();
    const frames = burn(BURN_MIN + CATCH_SECONDS - 1, 2, fuel);
    expect(frames.at(-1)).toEqual(LIT);
  });

  it("can be caught while it is still guttering", () => {
    const fuel = createFuel(seeded(4));
    while (fuel.phase === "burning") fuel.step(DT);
    burn(5, 4, fuel);
    expect(fuel.phase).toBe("dying");
    fuel.relight();
    expect(fuel.phase).toBe("catching");
  });

  it("cannot be lit while it is already burning", () => {
    const fuel = createFuel(seeded(4));
    fuel.step(DT);
    fuel.relight();
    expect(fuel.phase).toBe("burning");
  });

  it("rises without leaping or flashing", () => {
    const fuel = goOut(3);
    fuel.relight();
    const frames = burn(CATCH_SECONDS, 3, fuel);
    for (let i = 1; i < frames.length; i++) {
      expect(Math.abs(frames[i]!.reach - frames[i - 1]!.reach)).toBeLessThan(0.06);
      expect(Math.abs(frames[i]!.strength - frames[i - 1]!.strength)).toBeLessThan(0.12);
    }
  });
});

describe("flashing", () => {
  it.each([1, 2, 3, 4, 5])(
    "a lit block of writing never changes by more than WCAG's flash threshold, from guttering to caught (seed %i)",
    (seed) => {
      // As in torch.test.ts: a block under the light, a fifth ink, and the
      // darkness left at the heart of the light with flame and fuel together.
      const ink = token("--ink");
      const paper = token("--paper");
      const fuel = createFuel(seeded(seed));
      const flame = createFlame(seeded(seed + 10));
      burn(BURN_MAX, seed, fuel);
      const block = () => {
        const fire = fuel.step(DT);
        const f = flame.step(DT);
        const strength = f.strength * fire.strength;
        const left = darknessOf(darknessFor(strength), fire) * (1 - Math.min(1, strength));
        return 0.2 * luminance(inTheDark(ink, left)) + 0.8 * luminance(inTheDark(paper, left));
      };
      const lums = Array.from({ length: Math.round((DYING_SECONDS + 3) / DT) }, block);
      fuel.relight();
      lums.push(...Array.from({ length: Math.round((CATCH_SECONDS + 0.5) / DT) }, block));
      // WCAG 2.3.1: a flash is a pair of opposing changes of 10% of the
      // brightest luminance. No single frame comes close to one.
      const top = Math.max(...lums);
      for (let i = 1; i < lums.length; i++) {
        expect(Math.abs(lums[i]! - lums[i - 1]!)).toBeLessThan(top * 0.1);
      }
    },
  );
});

describe("across a reload", () => {
  it("carries on burning with what was left", () => {
    const fuel = createFuel(seeded(1), { phase: "burning", left: 2 });
    const frames = burn(3, 1, fuel);
    expect(frames.at(-1)!.phase).toBe("dying");
  });

  it("stays out, and cold, if it was out", () => {
    const fuel = createFuel(seeded(1), { phase: "out", left: 0 });
    const fire = fuel.step(DT);
    expect(fire.phase).toBe("out");
    expect(fire.coal).toBe(0);
  });

  it("never keeps more than a fresh torch's worth", () => {
    const fuel = createFuel(seeded(1), { phase: "burning", left: 1e9 });
    expect(fuel.snapshot().left).toBeLessThanOrEqual(BURN_MAX);
  });
});

describe("smoke", () => {
  it("rises from the torch and thins out to nothing", () => {
    const smoke = createSmoke(seeded(2));
    let frames: ReturnType<ReturnType<typeof createSmoke>["step"]>[] = [];
    for (let t = 0; t < 3; t += DT) frames.push(smoke.step(DT, 500, 500, 1));
    expect(frames.at(-1)!.length).toBeGreaterThan(0);
    for (const frame of frames) for (const puff of frame) expect(puff.y).toBeLessThanOrEqual(500);
    frames = [];
    for (let t = 0; t < 5; t += DT) frames.push(smoke.step(DT, 500, 500, 0));
    expect(frames.at(-1)).toHaveLength(0);
  });

  it("is never thick", () => {
    const smoke = createSmoke(seeded(3));
    for (let t = 0; t < 20; t += DT) {
      const puffs = smoke.step(DT, 500, 500, 1);
      expect(puffs.length).toBeLessThanOrEqual(14);
      for (const p of puffs) expect(p.alpha).toBeLessThanOrEqual(1);
    }
  });
});
