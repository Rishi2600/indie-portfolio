import { toBrahmi } from "./brahmi";
import {
  decode,
  flakedAt,
  strengthAt,
  WALL_W,
  wear,
  wetness,
  type HandMark,
  type Mark,
  type Pigment,
  type StrokeMark,
  type WritingMark,
} from "./marks";

/**
 * Painting the wall from its marks, onto a canvas (Wall.tsx).
 *
 * Each mark is painted on its own into a small scratch canvas, worn there,
 * and only then laid on the wall: the wear is a pattern of flakes knocked
 * out of the paint (destination-out), and it has to take the paint away
 * without taking away the older paint beneath. Then it is laid on at the
 * strength its age leaves it, oldest first, so newer paint covers older.
 */

/** The three pigments of the rock shelters, as each light shows them. */
export type Palette = Record<Pigment, string>;

/** By torchlight on the stone: red ochre, white clay and charcoal. */
export const NIGHT: Palette = { ochre: "#c4502c", white: "#e8dcc2", charcoal: "#120d0a" };
/** On the scroll by day: ochre is the rubric, charcoal the ink, and white clay a pale wash. */
export const DAY: Palette = { ochre: "#9c3a28", white: "#b8ab90", charcoal: "#22201c" };

/* -- Flakes ----------------------------------------------------------------

   Where the rock has flaked away from under the paint: fractal noise,
   thresholded so that a given share of it is gone. Made once, tileable, and
   kept for each of a few levels of wear. */

const TILE = 256;
const LEVELS = 8;

function noiseField(seed: number): Float32Array {
  let s = seed >>> 0;
  const random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const field = new Float32Array(TILE * TILE);
  // Weighted towards the fine octaves: paint flakes in chips and crumbs,
  // with only a few broad losses, not in even breaks along a stroke.
  let amplitude = 0.4;
  for (const cell of [64, 32, 16, 8, 4]) {
    const n = TILE / cell;
    const grid = Array.from({ length: n * n }, random);
    const at = (gx: number, gy: number) => grid[((gy + n) % n) * n + ((gx + n) % n)]!;
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        const fx = x / cell;
        const fy = y / cell;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = (fx - x0) * (fx - x0) * (3 - 2 * (fx - x0));
        const ty = (fy - y0) * (fy - y0) * (3 - 2 * (fy - y0));
        const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
        const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
        field[y * TILE + x]! += (top + (bottom - top) * ty) * amplitude;
      }
    }
    amplitude *= 0.74;
  }
  return field;
}

let flakeTiles: HTMLCanvasElement[] | null = null;

function flakes(): HTMLCanvasElement[] {
  if (flakeTiles) return flakeTiles;
  const field = noiseField(7);
  const sorted = Float32Array.from(field).sort();
  flakeTiles = Array.from({ length: LEVELS }, (_, level) => {
    const share = flakedAt(level / (LEVELS - 1));
    const cut = sorted[Math.floor(share * (sorted.length - 1))]!;
    const canvas = document.createElement("canvas");
    canvas.width = TILE;
    canvas.height = TILE;
    const ctx = canvas.getContext("2d")!;
    const image = ctx.createImageData(TILE, TILE);
    for (let i = 0; i < field.length; i++) {
      // Soft at the edge of a flake, and a fine speckle of grain everywhere.
      const edge = Math.min(Math.max((cut - field[i]!) / 0.025 + 0.5, 0), 1);
      const grain = ((i * 2654435761) >>> 0) % 100 < 7 ? 0.6 : 0;
      image.data[i * 4 + 3] = Math.round(Math.max(edge, grain) * 255);
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  });
  return flakeTiles;
}

/* -- Shapes ----------------------------------------------------------------

   Each kind of mark, drawn in wall units into a context already scaled to
   them, in its pigment at full strength. */

function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** A finger of paint: smooth through the points, swelling and thinning with them, its edge uneven. */
function stroke(ctx: CanvasRenderingContext2D, mark: StrokeMark) {
  const points = decode(mark.points);
  const random = seeded(mark.seed);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Three passes: the body of the stroke, and two thinner ones knocked a
  // little to either side, which give a fingertip's uneven edge.
  for (const [offset, thin, alpha] of [
    [0, 1, 1],
    [0.18, 0.7, 0.55],
    [-0.16, 0.66, 0.5],
  ] as const) {
    ctx.globalAlpha = alpha;
    const wobble = (random() - 0.5) * 0.1;
    if (points.length === 1) {
      const p = points[0]!;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (mark.size * thin * (0.35 + 0.65 * p.w)) / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1]!;
      const b = points[i]!;
      const c = points[i + 1];
      const width = mark.size * thin * (0.35 + 0.65 * (a.w + b.w) / 2);
      const nx = -(b.y - a.y);
      const ny = b.x - a.x;
      const length = Math.hypot(nx, ny) || 1;
      const shift = (offset + wobble) * width;
      const ox = (nx / length) * shift;
      const oy = (ny / length) * shift;
      ctx.lineWidth = width;
      ctx.beginPath();
      // From the middle of one segment to the middle of the next, curving
      // through the point between: no corners where the finger had none.
      const from = i === 1 ? a : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const to = c ? { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 } : b;
      ctx.moveTo(from.x + ox, from.y + oy);
      ctx.quadraticCurveTo(b.x + ox, b.y + oy, to.x + ox, to.y + oy);
      ctx.stroke();
    }
  }
  // The ridges of a fingertip dragged through paint: thin streaks along the
  // stroke where less of it was laid down.
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = 0.28;
  for (const offset of [-0.28, -0.06, 0.2]) {
    ctx.lineWidth = mark.size * 0.07;
    ctx.beginPath();
    points.forEach((p, i) => {
      const q = points[Math.min(i + 1, points.length - 1)]!;
      const r = points[Math.max(i - 1, 0)]!;
      const nx = -(q.y - r.y);
      const ny = q.x - r.x;
      const length = Math.hypot(nx, ny) || 1;
      const shift = offset * mark.size * (0.35 + 0.65 * p.w);
      const x = p.x + (nx / length) * shift;
      const y = p.y + (ny / length) * shift;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

/** A hand, palm at the origin and fingers up, a little different every time. */
function handShape(ctx: CanvasRenderingContext2D, size: number, random: () => number) {
  const palm = size * 0.27;
  ctx.beginPath();
  ctx.ellipse(0, palm * 0.1, palm, palm * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // The wrist, narrowing into the forearm and out of the stencil.
  ctx.beginPath();
  ctx.moveTo(-palm * 0.82, palm * 0.5);
  ctx.quadraticCurveTo(-palm * 0.7, size * 0.6, -palm * 0.78, size * 0.95);
  ctx.lineTo(palm * 0.78, size * 0.95);
  ctx.quadraticCurveTo(palm * 0.7, size * 0.6, palm * 0.82, palm * 0.5);
  ctx.fill();
  const spread = 0.8 + random() * 0.5;
  const fingers = [
    // The thumb, set low on the palm and leaning out.
    { at: -0.92, up: 0.15, length: 0.36, width: 0.11, angle: -58 },
    { at: -0.6, up: -0.78, length: 0.44, width: 0.095, angle: -14 },
    { at: -0.2, up: -0.95, length: 0.5, width: 0.1, angle: -4 },
    { at: 0.22, up: -0.92, length: 0.47, width: 0.095, angle: 6 },
    { at: 0.6, up: -0.72, length: 0.37, width: 0.085, angle: 18 },
  ];
  for (const finger of fingers) {
    const angle = ((finger.angle * spread + (random() - 0.5) * 10) * Math.PI) / 180;
    const length = size * finger.length * (0.93 + random() * 0.12);
    const half = (size * finger.width) / 2;
    // A finger: wide at the knuckle, rounded and a little narrower at the tip.
    ctx.save();
    ctx.translate(finger.at * palm, finger.up * palm);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-half, palm * 0.3);
    ctx.lineTo(-half * 0.82, -length + half * 0.8);
    ctx.arc(0, -length + half * 0.8, half * 0.82, Math.PI, 0);
    ctx.lineTo(half, palm * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/** Ochre blown around a hand held to the rock: a cloud of spray, and the hand left bare. */
function hand(ctx: CanvasRenderingContext2D, mark: HandMark) {
  const random = seeded(mark.seed);
  ctx.save();
  ctx.translate(mark.x, mark.y);
  ctx.rotate(mark.angle);
  const reach = mark.size * 1.05;
  ctx.globalCompositeOperation = "source-over";
  // Painted as a mask in black, then coloured. Blown from the mouth in
  // puffs, never quite the same twice: a few clouds overlapping, unevenly.
  for (let i = 0; i < 6; i++) {
    const cx = (random() - 0.5) * mark.size * 0.5;
    const cy = -mark.size * 0.15 + (random() - 0.5) * mark.size * 0.5;
    const r = reach * (0.6 + random() * 0.4);
    const cloud = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    cloud.addColorStop(0, "rgba(0,0,0,0.5)");
    cloud.addColorStop(0.55, "rgba(0,0,0,0.32)");
    cloud.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cloud;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.fillStyle = "#000";
  for (let i = 0; i < 260; i++) {
    const a = random() * Math.PI * 2;
    const r = reach * (0.5 + random() * 0.6);
    ctx.globalAlpha = 0.3 + random() * 0.5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r, Math.sin(a) * r - mark.size * 0.15, mark.size * (0.004 + random() * 0.01), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  handShape(ctx, mark.size, random);
  ctx.restore();
}

/** Words in Brahmi, set in the given face. */
function writing(ctx: CanvasRenderingContext2D, mark: WritingMark, face: string) {
  ctx.font = `${mark.size}px ${face}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(toBrahmi(mark.text), mark.x, mark.y);
}

/** Where a mark lies, in wall units, with room for its spray and wobble. */
export function bounds(mark: Mark, measure: CanvasRenderingContext2D, face: string) {
  if (mark.kind === "hand") {
    const r = mark.size * 1.6;
    return { x: mark.x - r, y: mark.y - r, w: r * 2, h: r * 2 };
  }
  if (mark.kind === "writing") {
    measure.font = `${mark.size}px ${face}`;
    const width = measure.measureText(toBrahmi(mark.text)).width;
    return { x: mark.x - mark.size * 0.2, y: mark.y - mark.size * 1.3, w: width + mark.size * 0.4, h: mark.size * 2 };
  }
  const points = decode(mark.points);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const pad = mark.size;
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
}

let scratch: HTMLCanvasElement | null = null;

/**
 * Paints one mark onto the wall's context, which draws at `scale` pixels to
 * the wall unit, as `now` finds it: wet, dry or weathered.
 */
export function paintMark(
  wall: CanvasRenderingContext2D,
  mark: Mark,
  { scale, palette, now, face }: { scale: number; palette: Palette; now: number; face: string },
) {
  scratch ??= document.createElement("canvas");
  const ctx = scratch.getContext("2d")!;
  const box = bounds(mark, ctx, face);
  const w = Math.ceil(box.w * scale) + 2;
  const h = Math.ceil(box.h * scale) + 2;
  if (w <= 2 || h <= 2) return;
  if (scratch.width < w || scratch.height < h) {
    scratch.width = Math.max(scratch.width, w);
    scratch.height = Math.max(scratch.height, h);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, w, h);

  // The shape, in wall units.
  ctx.setTransform(scale, 0, 0, scale, -box.x * scale, -box.y * scale);
  const colour = palette[mark.pigment];
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  if (mark.kind === "stroke") stroke(ctx, mark);
  else if (mark.kind === "writing") writing(ctx, mark, face);
  else {
    hand(ctx, mark);
    // The hand was laid down as a mask: colour it now.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, w, h);
  }

  // The wear: flakes knocked out of the paint, more as it ages. Wet paint
  // has none; the grain of the rock comes through as it dries.
  const age = now - mark.made;
  const worn = wear(age);
  const tiles = flakes();
  const tile = tiles[Math.min(LEVELS - 1, Math.round(worn * (LEVELS - 1)))]!;
  const pattern = ctx.createPattern(tile, "repeat");
  if (pattern) {
    const random = seeded(mark.seed);
    // The flakes are a property of the rock, so they keep their size on the
    // wall whatever the screen: a tile is 90 wall units across.
    const k = (90 * scale) / TILE;
    pattern.setTransform(new DOMMatrix().translate(-box.x * scale - random() * 900 * scale, -box.y * scale - random() * 900 * scale).scale(k));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1 - wetness(age);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  }

  wall.save();
  wall.setTransform(1, 0, 0, 1, 0, 0);
  wall.globalCompositeOperation = "source-over";
  wall.globalAlpha = strengthAt(worn);
  wall.drawImage(scratch, 0, 0, w, h, Math.floor(box.x * scale), Math.floor(box.y * scale), w, h);
  wall.restore();
}

/** Paints the whole wall, oldest mark first, onto a cleared canvas. */
export function paintWall(
  wall: CanvasRenderingContext2D,
  marks: readonly Mark[],
  options: { scale: number; palette: Palette; now: number; face: string },
) {
  wall.setTransform(1, 0, 0, 1, 0, 0);
  wall.clearRect(0, 0, wall.canvas.width, wall.canvas.height);
  for (const mark of marks) paintMark(wall, mark, options);
}

/** The scale at which a canvas this many pixels wide shows the whole wall. */
export const scaleFor = (pixels: number) => pixels / WALL_W;
