import { DRY_SECONDS, WALL_H, WALL_W, type Mark } from "./marks";
import { DAY, NIGHT, paintMark, paintWall, scaleFor } from "./paint";

/** Sharper than this costs memory and buys nothing a reader can see. */
const MAX_DPR = 2;

const isNight = () => document.documentElement.getAttribute("data-theme") === "night";
const isWet = (mark: Mark, now: number) => now - mark.made < DRY_SECONDS * 1000;

/**
 * The wall as it is painted: two canvases, one over the other.
 *
 * - The wall: every dry mark, painted once when the page opens, and again
 *   only when something changes the whole of it (a resize, the theme,
 *   another tab, a wash).
 * - The hand: what is being made right now, and marks still wet, painted
 *   every frame while there are any, then handed down to the wall once dry.
 *
 * So no frame ever repaints the whole wall, however much is on it. The same
 * split is common in drawing apps: a static layer and an interactive one.
 */
export function createSurface(wall: HTMLCanvasElement, hand: HTMLCanvasElement, face: string) {
  let marks: Mark[] = [];
  let wet: Mark[] = [];
  let making: Mark | null = null;
  let frame = 0;

  const options = (now: number) => ({
    scale: scaleFor(wall.width),
    palette: isNight() ? NIGHT : DAY,
    now,
    face,
  });

  function paintHand() {
    const ctx = hand.getContext("2d");
    if (!ctx) return;
    const now = Date.now();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, hand.width, hand.height);
    // Dry now: down onto the wall for good, and off the hand.
    const below = wall.getContext("2d");
    wet = wet.filter((mark) => {
      if (isWet(mark, now)) return true;
      if (below) paintMark(below, mark, options(now));
      return false;
    });
    for (const mark of wet) paintMark(ctx, mark, options(now));
    if (making) paintMark(ctx, making, options(now));
  }

  /** Paints the hand every frame while anything on it is still wet or being made. */
  function wake() {
    if (frame) return;
    const step = () => {
      paintHand();
      frame = wet.length || making ? requestAnimationFrame(step) : 0;
    };
    frame = requestAnimationFrame(step);
  }

  function paintAll() {
    const ctx = wall.getContext("2d");
    if (!ctx) return;
    const now = Date.now();
    wet = marks.filter((m) => isWet(m, now));
    paintWall(
      ctx,
      marks.filter((m) => !isWet(m, now)),
      options(now),
    );
    paintHand();
    if (wet.length) wake();
  }

  return {
    /** Fits both canvases to the stone's width in CSS pixels, and repaints. */
    resize(cssWidth: number) {
      const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
      const width = Math.round(cssWidth * dpr);
      const height = Math.round((width * WALL_H) / WALL_W);
      for (const canvas of [wall, hand]) {
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }
      paintAll();
    },
    /** The whole wall, replaced: on opening, and when another tab changes it. */
    show(all: Mark[]) {
      marks = all;
      paintAll();
    },
    /** A mark just made and kept: wet on the hand until it dries. */
    add(mark: Mark) {
      marks = [...marks, mark];
      wet = [...wet, mark];
      wake();
    },
    /** The mark being made, or null when it is finished or abandoned. */
    making(mark: Mark | null) {
      making = mark;
      if (mark) wake();
      else paintHand();
    },
    repaint: paintAll,
    /** The wall as an image a visitor can keep, on its own ground. */
    picture(ground: string): HTMLCanvasElement {
      const out = document.createElement("canvas");
      out.width = wall.width;
      out.height = wall.height;
      const ctx = out.getContext("2d")!;
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, out.width, out.height);
      // As the wall will be in a moment, when even the newest mark is dry.
      const dry = Date.now() + DRY_SECONDS * 1000;
      for (const mark of marks) paintMark(ctx, mark, options(dry));
      return out;
    },
    destroy() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}

export type Surface = ReturnType<typeof createSurface>;
