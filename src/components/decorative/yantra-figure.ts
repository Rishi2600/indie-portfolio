import { around, petal, polar, scallop, spoke } from "./geometry";

/**
 * The yantra's construction as data: one entry per ring, from the centre out.
 * Shared by the page's <Yantra> and the social card, so both draw the same
 * figure from the same numbers.
 */

export const C = 100;

export type Ring = {
  /** Path data, optionally with "|<degrees>" for a rotation about the centre. */
  strokes: string[];
  circles?: number[];
  dots?: { x: number; y: number }[];
  dotRadius?: number;
};

export const RINGS: Ring[] = [
  // 0 — the padma: the mark itself, scaled.
  {
    strokes: around(8).map((deg) => `${petal(C, C, 0, 32, 7.3)}|${deg}`),
    circles: [13],
    dots: [{ x: C, y: C }],
    dotRadius: 2.6,
  },
  // 1 — the circle that holds it.
  { strokes: [], circles: [38] },
  // 2 — sixteen petals, set between the eight.
  {
    strokes: around(16, 11.25).map(
      (deg) => `${petal(C, C, 38, 60, 5.4)}|${deg}`,
    ),
    circles: [63],
  },
  // 3 — a ring of points.
  { strokes: [], dots: around(32, 5.625).map((deg) => polar(C, C, 67, deg)) },
  // 4 — fine spokes, like the divisions on a dial.
  { strokes: around(48).map((deg) => spoke(C, C, 71, 79, deg)) },
  // 5 — the scalloped border.
  { strokes: around(24).map((deg) => scallop(C, C, 84, deg, deg + 15)) },
  // 6 — the double rule.
  { strokes: [], circles: [92, 95] },
];

/** Splits a stroke entry into its path and its rotation, if any. */
export function strokeOf(entry: string): { d: string; deg?: string } {
  const [d = "", deg] = entry.split("|");
  return { d, deg };
}

/** The whole figure as an SVG string, for places that cannot render React. */
export function yantraSvg(color: string, strokeWidth: number, size: number): string {
  const body = RINGS.map((ring) => {
    const circles = (ring.circles ?? [])
      .map((r) => `<circle cx="${C}" cy="${C}" r="${r}"/>`)
      .join("");
    const strokes = ring.strokes
      .map((entry) => {
        const { d, deg } = strokeOf(entry);
        return `<path d="${d}"${deg ? ` transform="rotate(${deg} ${C} ${C})"` : ""}/>`;
      })
      .join("");
    const dots = (ring.dots ?? [])
      .map(
        (dot) =>
          `<circle cx="${dot.x}" cy="${dot.y}" r="${ring.dotRadius ?? 0.9}" fill="${color}" stroke="none"/>`,
      )
      .join("");
    return circles + strokes + dots;
  }).join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}">` +
    `<g fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`
  );
}
