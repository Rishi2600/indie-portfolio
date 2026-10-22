import { AIM_EVENT } from "@/lib/fuel";
import { encode, simplify, WALL_H, WALL_W, type Mark, type Pigment, type Point, type StrokeMark } from "./marks";

export type Tool = "paint" | "hand" | "write";
export const TOOLS: readonly Tool[] = ["paint", "hand", "write"];

/** A fingertip's width, a hand's span and a letter's height, in wall units. */
export const BRUSH = 14;
export const HAND = 110;
export const LETTER = 56;

/** Closer than this to the last point, a new one adds nothing. */
const STEP = 0.6;

type Hand = {
  tool: () => Tool;
  pigment: () => Pigment;
  /** The stroke as it is being made, every time it grows; null once it is done. */
  making: (mark: StrokeMark | null) => void;
  /** A finished mark, to keep. */
  made: (mark: Mark) => void;
  /** Where, in wall units, the visitor wants to write. */
  writeAt: (at: { x: number; y: number }) => void;
};

/**
 * The visitor's hand on the wall, from Pointer Events: one model for a
 * mouse, a pen and a finger alike.
 *
 * The pointer is captured for the length of a stroke, so it keeps painting
 * if it slides off the edge. Between two frames the browser may have seen a
 * dozen positions and fired one event; getCoalescedEvents() hands over every
 * one of them, which is the difference between a curve and a polygon. A
 * pen's pressure sets the width; a finger or a mouse has none worth the
 * name, so speed does it instead, as with real paint: a quick stroke runs
 * thin, a slow one is laid on thick.
 */
export function listen(canvas: HTMLCanvasElement, hand: Hand): () => void {
  let points: Point[] = [];
  let pointer = -1;
  let seed = 0;
  let width = 0.8;
  let last = 0;

  const toWall = (event: MouseEvent) => {
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * WALL_W,
      y: ((event.clientY - box.top) / box.height) * WALL_H,
    };
  };

  // A mouse carries the torch already; a finger or a pen asks for it.
  const aim = (event: PointerEvent) => {
    if (event.pointerType === "mouse") return;
    window.dispatchEvent(new CustomEvent(AIM_EVENT, { detail: { x: event.clientX, y: event.clientY } }));
  };

  const stroke = (): StrokeMark => ({
    kind: "stroke",
    pigment: hand.pigment(),
    size: BRUSH,
    points: encode(points),
    seed,
    made: Date.now(),
  });

  function widthAt(event: PointerEvent, at: { x: number; y: number }) {
    if (event.pointerType === "pen" && event.pressure > 0) return event.pressure;
    const previous = points.at(-1);
    const speed = previous ? Math.hypot(at.x - previous.x, at.y - previous.y) / Math.max(event.timeStamp - last, 1) : 0;
    width += (Math.min(Math.max(1.05 - speed * 0.9, 0.35), 1) - width) * 0.35;
    return width;
  }

  function down(event: PointerEvent) {
    if (event.button !== 0 || pointer !== -1) return;
    aim(event);
    const at = toWall(event);
    const tool = hand.tool();
    // Writing waits for the click (see place).
    if (tool === "write") return;
    if (tool === "hand") {
      return hand.made({
        kind: "hand",
        pigment: hand.pigment(),
        x: at.x,
        y: at.y,
        size: HAND * (0.9 + Math.random() * 0.2),
        angle: (Math.random() - 0.5) * 0.7,
        seed: Math.floor(Math.random() * 2 ** 31),
        made: Date.now(),
      });
    }
    canvas.setPointerCapture(event.pointerId);
    pointer = event.pointerId;
    seed = Math.floor(Math.random() * 2 ** 31);
    width = 0.8;
    last = event.timeStamp;
    points = [{ ...at, w: width }];
    hand.making(stroke());
  }

  function move(event: PointerEvent) {
    if (event.pointerId !== pointer) return;
    aim(event);
    const seen = event.getCoalescedEvents?.() ?? [];
    for (const each of seen.length ? seen : [event]) {
      const at = toWall(each);
      const previous = points.at(-1)!;
      if (Math.hypot(at.x - previous.x, at.y - previous.y) < STEP) continue;
      points.push({ ...at, w: widthAt(each, at) });
      last = each.timeStamp;
    }
    hand.making(stroke());
  }

  function up(event: PointerEvent) {
    if (event.pointerId !== pointer) return;
    pointer = -1;
    hand.making(null);
    // A stroke the browser took away (a scroll, a system gesture) is kept
    // only if it had got anywhere.
    if (event.type === "pointercancel" && points.length < 3) return;
    points = simplify(points);
    hand.made(stroke());
  }

  // Where to write is taken from the click, not the press: by the click the
  // browser has finished moving focus for the tap (on a touch screen it
  // does that late, just before the click), so the input given focus here
  // keeps it. Focus leaving the input first puts up what was typed there.
  function place(event: MouseEvent) {
    if (hand.tool() !== "write") return;
    hand.writeAt(toWall(event));
  }

  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("click", place);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  return () => {
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("click", place);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
  };
}
