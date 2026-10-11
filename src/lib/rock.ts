/**
 * The cave wall's relief.
 *
 * At night the page is a rock face, and rock is not flat: it bulges, it is
 * layered in tilted strata, it is split by narrow cracks and rough to the
 * touch. Here that surface is generated once as a height field and turned
 * into a map of which way each point of the rock faces. Rock.tsx then lights
 * that map from wherever the torch is, every frame, on the GPU: faces turned
 * towards the flame catch it, faces turned away fall into shadow, and most of
 * all in the ring around the light, where it rakes across the stone.
 *
 * Everything here tiles seamlessly, so two tiles at unrelated scales can be
 * laid over each other across a page of any length without a visible seam
 * or an obvious repeat.
 */

/** A repeatable stand-in for Math.random, so the rock is the same on every visit. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Value noise on a lattice that wraps, so the tile repeats without a seam. */
function lattice(cells: number, random: () => number) {
  const values = Float32Array.from({ length: cells * cells }, () => random());
  return (u: number, v: number) => {
    // u, v in [0, 1): position across the tile.
    const x = u * cells;
    const y = v * cells;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const at = (i: number, j: number) =>
      values[(((j % cells) + cells) % cells) * cells + (((i % cells) + cells) % cells)]!;
    const a = at(x0, y0);
    const b = at(x0 + 1, y0);
    const c = at(x0, y0 + 1);
    const d = at(x0 + 1, y0 + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/** Several octaves of noise, finer and fainter each time. */
function fractal(base: number, octaves: number, random: () => number) {
  const layers = Array.from({ length: octaves }, (_, o) => lattice(base * 2 ** o, random));
  let total = 0;
  for (let o = 0; o < octaves; o++) total += 0.5 ** o;
  return (u: number, v: number) => {
    let sum = 0;
    for (let o = 0; o < octaves; o++) sum += layers[o]!(u, v) * 0.5 ** o;
    return sum / total;
  };
}

export type ReliefTile = {
  size: number;
  /** RGBA per texel: the surface's facing in RGB (as 0..255), its height in A. */
  data: Uint8Array;
};

export type ReliefKind = "forms" | "grain" | "paper";

/**
 * A tile of rock relief.
 *
 * "forms" is the large tile: broad bulges, strata tilted across the wall,
 * and cracks. "grain" is the small tile: the roughness of the stone itself.
 * "paper" is a leaf of an old book by day: the gentle waves a page takes on
 * with age, and the fibres laid along it when it was made.
 */
export function reliefTile(kind: ReliefKind, size: number, seed = 1): ReliefTile {
  const random = seeded(seed);
  const height = new Float32Array(size * size);

  if (kind === "forms") {
    const bulge = fractal(2, 5, random);
    const ridge = fractal(3, 4, random);
    const warp = fractal(3, 3, random);
    const crack = fractal(4, 3, random);
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const u = i / size;
        const v = j / size;
        // Broad masses of rock, with sharp-crested ridges running over them.
        const crest = 1 - Math.abs(2 * ridge(u, v) - 1);
        let h = 0.55 * bulge(u, v) + 0.3 * crest * crest;
        // Ledges: the rock broken into steps, as layered stone weathers.
        const t = h * 6;
        const stepped = (Math.floor(t) + smoothstep(0.3, 0.7, t - Math.floor(t))) / 6;
        h = h * 0.45 + stepped * 0.55;
        // Strata: a few bands tilted across the tile, gently bent. Whole
        // numbers of bands in each direction keep the tile seamless.
        const band = Math.sin(2 * Math.PI * (1 * u + 3 * v) + warp(u, v) * 3);
        h += 0.06 * band;
        // Cracks: where the noise crosses its middle, a sharp narrow split.
        const split = Math.pow(1 - Math.abs(2 * crack(u, v) - 1), 70);
        height[j * size + i] = h - 0.18 * split;
      }
    }
  } else if (kind === "paper") {
    const cockle = fractal(2, 3, random);
    const fibre = fractal(16, 3, random);
    const fleck = fractal(32, 2, random);
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const u = i / size;
        const v = j / size;
        // Fibres run along the sheet: the noise is read stretched across it,
        // folded back on itself so the tile still wraps.
        const along = fibre(u, (v * 4) % 1);
        height[j * size + i] = 0.7 * cockle(u, v) + 0.2 * along + 0.1 * fleck(u, v);
      }
    }
  } else {
    const rough = fractal(8, 4, random);
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) height[j * size + i] = rough(i / size, j / size);
    }
  }

  // Into 0..1.
  let lo = Infinity;
  let hi = -Infinity;
  for (const h of height) {
    lo = Math.min(lo, h);
    hi = Math.max(hi, h);
  }
  for (let k = 0; k < height.length; k++) height[k] = (height[k]! - lo) / (hi - lo || 1);

  // Which way each texel faces, from the slope to its neighbours (wrapping).
  const steep = kind === "forms" ? size * 0.085 : kind === "paper" ? size * 0.03 : size * 0.05;
  const data = new Uint8Array(size * size * 4);
  const h = (i: number, j: number) => height[((j + size) % size) * size + ((i + size) % size)]!;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const dx = (h(i + 1, j) - h(i - 1, j)) * steep;
      const dy = (h(i, j + 1) - h(i, j - 1)) * steep;
      const n = Math.hypot(dx, dy, 1);
      const k = (j * size + i) * 4;
      data[k] = Math.round(((-dx / n) * 0.5 + 0.5) * 255);
      data[k + 1] = Math.round(((-dy / n) * 0.5 + 0.5) * 255);
      data[k + 2] = Math.round(((1 / n) * 0.5 + 0.5) * 255);
      data[k + 3] = Math.round(height[j * size + i]! * 255);
    }
  }
  return { size, data };
}

/* -- How the wall is lit ----------------------------------------------------

   The same arithmetic as the shader in Rock.tsx, kept here so the limits can
   be tested. A flat stretch of wall right under the flame shows exactly the
   theme's --paper; everything else is that colour times `wallLight`. */

/** The share of the stone's colour that stays in the dark, unlit by the torch. */
export const AMBIENT = 0.55;
/** How much the relief bends the light: 0 is a flat wall. */
export const RELIEF = 0.85;
/** How far a face may brighten or darken against a flat one, at most. */
export const FACING_MIN = 0.35;
export const FACING_MAX = 1.6;
/** How much the colour of the stone itself varies between ridge and hollow. */
export const ALBEDO_MIN = 0.88;
export const ALBEDO_MAX = 1.1;
/** The torch's height in front of the wall, as a share of its reach. */
export const TORCH_HEIGHT = 0.5;
/** How far the torch's light carries, as a share of its reach. */
export const FALLOFF = 1.6;
/** How deep the rock's relief is, in pixels: what decides how long its shadows fall. */
export const DEPTH = 46;

/**
 * How bright a point of wall is, against the theme's --paper.
 *
 * `facing` is how much more or less the point faces the flame than a flat
 * wall would; `distance` and `reach` are in pixels; `strength` is the flame's;
 * `lit` is how much of the flame the point can see past the rock in front of
 * it (1 in the open, less in a ridge's shadow).
 */
export function wallLight(
  facing: number,
  albedo: number,
  distance: number,
  reach: number,
  strength: number,
  lit = 1,
): number {
  const turned = Math.min(Math.max(facing, FACING_MIN), FACING_MAX);
  const relief = 1 + (turned - 1) * RELIEF;
  const carry = 1 / (1 + (distance / (reach * FALLOFF)) ** 2);
  const a = Math.min(Math.max(albedo, ALBEDO_MIN), ALBEDO_MAX);
  const open = Math.min(Math.max(lit, 0), 1);
  return a * (AMBIENT + (1 - AMBIENT) * carry * strength * relief * open);
}

/** The brightest any point of the wall can ever be, against --paper. */
export const BRIGHTEST =
  ALBEDO_MAX * (AMBIENT + (1 - AMBIENT) * 1.04 * (1 + (FACING_MAX - 1) * RELIEF));
