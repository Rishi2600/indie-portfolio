import { describe, expect, it } from "vitest";
import {
  decode,
  DRY_SECONDS,
  encode,
  flakedAt,
  GHOST,
  MAX_POINTS,
  simplify,
  strengthAt,
  WALL_H,
  WALL_W,
  wear,
  WEATHER_DAYS,
  wetness,
  type Point,
} from "./marks";

const DAY = 86_400_000;

describe("keeping a stroke", () => {
  it("comes back where it was, to a tenth of a wall unit", () => {
    const points: Point[] = [
      { x: 12.34, y: 567.89, w: 0.5 },
      { x: 999.96, y: 0.04, w: 1 },
    ];
    const back = decode(encode(points));
    back.forEach((p, i) => {
      expect(p.x).toBeCloseTo(points[i]!.x, 1);
      expect(p.y).toBeCloseTo(points[i]!.y, 1);
      expect(p.w).toBeCloseTo(points[i]!.w, 3);
    });
  });

  it("keeps a point off the wall on its edge", () => {
    const [p] = decode(encode([{ x: -40, y: WALL_H + 90, w: 3 }]));
    expect(p).toEqual({ x: 0, y: WALL_H, w: 1 });
  });

  it("fits the whole wall in sixteen bits", () => {
    expect(WALL_W * 10).toBeLessThan(65536);
    expect(WALL_H * 10).toBeLessThan(65536);
  });

  it("costs six bytes a point and stops at the most a stroke may have", () => {
    const many = Array.from({ length: MAX_POINTS + 500 }, (_, i) => ({ x: i % 1000, y: 10, w: 0.5 }));
    const kept = encode(many);
    expect(kept.byteLength).toBe(MAX_POINTS * 6);
  });
});

describe("simplifying a stroke", () => {
  it("drops the points a straight line does not need", () => {
    const line = Array.from({ length: 200 }, (_, i) => ({ x: i, y: i * 0.5, w: 0.5 }));
    expect(simplify(line)).toHaveLength(2);
  });

  it("keeps the corners", () => {
    const corner = [
      ...Array.from({ length: 50 }, (_, i) => ({ x: i, y: 0, w: 0.5 })),
      ...Array.from({ length: 50 }, (_, i) => ({ x: 50, y: i + 1, w: 0.5 })),
    ];
    const kept = simplify(corner);
    expect(kept.length).toBeGreaterThanOrEqual(3);
    expect(kept.some((p) => p.x === 49 || p.x === 50)).toBe(true);
  });

  it("keeps a change of width along a straight line", () => {
    const swelling = Array.from({ length: 100 }, (_, i) => ({ x: i, y: 0, w: i < 50 ? 0.3 : 0.9 }));
    expect(simplify(swelling).length).toBeGreaterThan(2);
  });

  it("never moves the line by more than its tolerance", () => {
    const wave = Array.from({ length: 400 }, (_, i) => ({ x: i, y: Math.sin(i / 20) * 40, w: 0.5 }));
    const kept = simplify(wave, 0.4);
    expect(kept.length).toBeLessThan(wave.length / 3);
    for (const p of wave) {
      // The distance to the nearest kept segment, measured square to it.
      let nearest = Infinity;
      for (let i = 1; i < kept.length; i++) {
        const a = kept[i - 1]!;
        const b = kept[i]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const t = Math.min(Math.max(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy), 0), 1);
        nearest = Math.min(nearest, Math.hypot(a.x + dx * t - p.x, a.y + dy * t - p.y));
      }
      expect(nearest).toBeLessThan(0.45);
    }
  });
});

describe("weathering", () => {
  it("is fresh when made and wears towards a ghost", () => {
    expect(wear(0)).toBe(0);
    expect(strengthAt(wear(0))).toBe(1);
    expect(wear(WEATHER_DAYS * DAY)).toBeCloseTo(1 - Math.exp(-1));
    expect(strengthAt(wear(365 * DAY))).toBeCloseTo(GHOST, 2);
  });

  it("never wears a mark away entirely", () => {
    expect(strengthAt(1)).toBeCloseTo(GHOST, 10);
    expect(GHOST).toBeGreaterThan(0.1);
  });

  it("only ever wears further: older is never fresher", () => {
    let previous = -1;
    for (let d = 0; d < 200; d += 0.5) {
      const now = wear(d * DAY);
      expect(now).toBeGreaterThan(previous);
      previous = now;
    }
  });

  it("flakes in patches, more as it wears, never all of it", () => {
    expect(flakedAt(0)).toBeGreaterThan(0);
    expect(flakedAt(1)).toBeGreaterThan(flakedAt(0.5));
    expect(flakedAt(1)).toBeLessThan(0.7);
  });

  it("is a week older after a week, however long the page was closed", () => {
    expect(wear(7 * DAY)).toBeGreaterThan(wear(1 * DAY));
  });

  it("dries in a few seconds", () => {
    expect(wetness(0)).toBe(1);
    expect(wetness(DRY_SECONDS * 500)).toBeCloseTo(0.5);
    expect(wetness(DRY_SECONDS * 1000)).toBe(0);
    expect(wetness(-5)).toBe(1);
  });
});
