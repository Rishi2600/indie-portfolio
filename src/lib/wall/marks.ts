/**
 * What a visitor leaves on the wall, as it is kept.
 *
 * Not pixels: each mark is the gesture that made it. A stroke is the path the
 * finger took, a handprint is where the hand was pressed and a writing is the
 * words typed, each with the moment it was made. The wall is painted again
 * from them whenever it is shown, which is what lets it weather: how worn a
 * mark looks is worked out from its age at the moment it is drawn, so a wall
 * left for a month comes back a month older. docs/THE_WALL.md has the long
 * version, and why not a PNG.
 *
 * Everything is in wall units: the wall is WALL_W wide and WALL_H tall
 * whatever size it is shown at, so a mark made on a phone sits in the same
 * place on a laptop.
 */

export const WALL_W = 1000;
export const WALL_H = 1250;

export type Pigment = "ochre" | "white" | "charcoal";
export const PIGMENTS: readonly Pigment[] = ["ochre", "white", "charcoal"];

type Made = {
  /** IndexedDB's key, once it has been kept. */
  id?: number;
  /** When it was made, in milliseconds since 1970: how old it is decides how worn. */
  made: number;
  pigment: Pigment;
  /** Fixes the mark's own wear pattern and wobble, so it weathers the same way every time it is drawn. */
  seed: number;
};

/** A stroke of paint: points as x, y, width triples, in tenths of a wall unit (see encode). */
export type StrokeMark = Made & { kind: "stroke"; size: number; points: Uint16Array };
/** A stencilled hand: ochre blown around a hand held to the rock. */
export type HandMark = Made & { kind: "hand"; x: number; y: number; size: number; angle: number };
/** Words, kept as typed and painted in Brahmi (brahmi.ts). */
export type WritingMark = Made & { kind: "writing"; x: number; y: number; size: number; text: string };

export type Mark = StrokeMark | HandMark | WritingMark;

/** How many marks a wall keeps before the oldest are worn away entirely. */
export const MAX_MARKS = 4000;
/** How many points one stroke may have; a longer one is cut there. */
export const MAX_POINTS = 2000;
/** Longest writing, in characters. */
export const MAX_TEXT = 80;

export type Point = { x: number; y: number; w: number };

/**
 * Points to a Uint16Array of x, y, w triples. x and y are kept to a tenth of
 * a wall unit (a seventh of a pixel on a wide screen) and w, the width as a
 * share of the brush, to a thousandth: six bytes a point, against about
 * thirty as JSON.
 */
export function encode(points: readonly Point[]): Uint16Array {
  const n = Math.min(points.length, MAX_POINTS);
  const out = new Uint16Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = points[i]!;
    out[i * 3] = Math.round(Math.min(Math.max(p.x, 0), WALL_W) * 10);
    out[i * 3 + 1] = Math.round(Math.min(Math.max(p.y, 0), WALL_H) * 10);
    out[i * 3 + 2] = Math.round(Math.min(Math.max(p.w, 0), 1) * 1000);
  }
  return out;
}

export function decode(data: Uint16Array): Point[] {
  const out: Point[] = [];
  for (let i = 0; i + 2 < data.length; i += 3) {
    out.push({ x: data[i]! / 10, y: data[i + 1]! / 10, w: data[i + 2]! / 1000 });
  }
  return out;
}

/**
 * Fewer points, the same line: Ramer–Douglas–Peucker. A point is kept only
 * if leaving it out would move the line by more than `tolerance` wall units.
 * Pointer events arrive at the screen's rate or faster, and most of what they
 * report on a smooth curve is redundant.
 */
export function simplify(points: readonly Point[], tolerance = 0.4): Point[] {
  if (points.length < 3) return [...points];
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const p = points[a]!;
    const q = points[b]!;
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const length = Math.hypot(dx, dy);
    let far = -1;
    let farthest = tolerance;
    for (let i = a + 1; i < b; i++) {
      const r = points[i]!;
      const d = length === 0 ? Math.hypot(r.x - p.x, r.y - p.y) : Math.abs(dy * r.x - dx * r.y + q.x * p.y - q.y * p.x) / length;
      // A sudden change of width is worth a point too, not only of direction.
      const dw = Math.abs(r.w - (p.w + ((q.w - p.w) * (i - a)) / (b - a))) * 4;
      if (Math.max(d, dw) > farthest) {
        farthest = Math.max(d, dw);
        far = i;
      }
    }
    if (far >= 0) {
      keep[far] = 1;
      stack.push([a, far], [far, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/* -- Weathering ------------------------------------------------------------

   Fresh paint is wet for a few seconds, a little darker and glossier, and
   dries matte. Then it weathers: slowly fainter and patchier over weeks, as
   the rock flakes away under it, until a ghost is left. A ghost never goes
   entirely; only MAX_MARKS wears the oldest right off. */

export const DRY_SECONDS = 4;
/** Days for the weathering to go about two thirds of the way. */
export const WEATHER_DAYS = 12;
/** How much of a mark is left when it is as worn as it gets. */
export const GHOST = 0.22;

const DAY = 86_400_000;

/** How weathered a mark is at `age` milliseconds old: 0 fresh, towards 1. */
export function wear(age: number): number {
  return 1 - Math.exp(-Math.max(age, 0) / (WEATHER_DAYS * DAY));
}

/** How strongly a mark shows at that wear. */
export function strengthAt(worn: number): number {
  return 1 - (1 - GHOST) * worn;
}

/** How much of the rock has flaked from under it: the share of patches gone. */
export function flakedAt(worn: number): number {
  return 0.06 + 0.5 * worn;
}

/** How wet it still is, 1 just painted, 0 dry. */
export function wetness(age: number): number {
  return Math.min(Math.max(1 - age / (DRY_SECONDS * 1000), 0), 1);
}
