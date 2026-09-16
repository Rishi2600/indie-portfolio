/**
 * Plane geometry for the ornaments. Angles are in degrees, measured clockwise
 * from twelve o'clock, because that is how a figure drawn with a compass on
 * a page is read.
 */

const round = (n: number) => Math.round(n * 100) / 100;

export function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: round(cx + r * Math.cos(a)), y: round(cy + r * Math.sin(a)) };
}

/** `count` angles, evenly spaced, starting at `offset`. */
export function around(count: number, offset = 0): number[] {
  return Array.from({ length: count }, (_, i) => round(offset + (i * 360) / count));
}

/**
 * One lotus petal pointing up from the centre, rising from radius `inner` to
 * radius `outer`, `width` either side at its fullest. With inner 0, outer 22
 * and width 5 on a 64-unit square it is exactly the padma in the site's mark;
 * every larger petal on the site is this one, scaled.
 */
export function petal(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  width: number,
): string {
  const base = cy - inner;
  const tip = cy - outer;
  const length = outer - inner;
  const c1 = round(base - length * 0.36);
  const c2 = round(base - length * 0.77);
  const l = round(cx - width);
  const r = round(cx + width);
  return `M${cx} ${round(base)}C${l} ${c1} ${l} ${c2} ${cx} ${round(tip)}C${r} ${c2} ${r} ${c1} ${cx} ${round(base)}Z`;
}

/**
 * A scallop: a half-circle standing on the arc of a larger circle, between
 * two angles, bulging outwards — the lobed border of a manuscript medallion.
 */
export function scallop(
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
): string {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  const radius = round(Math.hypot(b.x - a.x, b.y - a.y) / 2);
  return `M${a.x} ${a.y}A${radius} ${radius} 0 0 1 ${b.x} ${b.y}`;
}

/** A straight radial stroke between two radii. */
export function spoke(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  deg: number,
): string {
  const a = polar(cx, cy, inner, deg);
  const b = polar(cx, cy, outer, deg);
  return `M${a.x} ${a.y}L${b.x} ${b.y}`;
}
