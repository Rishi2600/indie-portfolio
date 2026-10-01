"use client";

import { useEffect, useRef } from "react";
import {
  createFlame,
  DARK_RGB,
  darknessFor,
  STILL,
  type FlameState,
} from "@/lib/torch";
import styles from "./Torch.module.css";

/**
 * The light is soft-edged, so it is drawn at a third of the screen's size and
 * scaled up: a ninth of the pixels, and no visible difference.
 */
const SCALE = 3;

/**
 * The flame is never a circle. Its light is a handful of lobes around the
 * flame, offsets and sizes as fractions of its reach, each wandering on its
 * own slow period; the uppermost is the tongue that leans up.
 */
const LOBES = [
  { x: 0, y: 0, r: 1, a: 1, wander: 0, period: 1 },
  { x: 0.2, y: -0.16, r: 0.7, a: 0.85, wander: 0.07, period: 2.3 },
  { x: -0.22, y: -0.04, r: 0.66, a: 0.8, wander: 0.06, period: 3.1 },
  { x: 0.06, y: 0.2, r: 0.58, a: 0.7, wander: 0.05, period: 2.7 },
  { x: -0.04, y: -0.3, r: 0.5, a: 0.75, wander: 0.08, period: 1.9 },
] as const;

/**
 * The pool is wider than it is tall, as a torch held at an angle throws it,
 * and as lines of writing run: more of a line is lit at once.
 */
const WIDE = 1.3;
const TALL = 0.9;

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const MORE_CONTRAST = "(prefers-contrast: more)";

type Point = { x: number; y: number };

/**
 * The torch, at night.
 *
 * Darkness lies over the whole page, ground and writing alike, and the torch
 * cuts it back: inside its light the page is at full contrast, outside it the
 * cave is dark. It is how the page is read at night, so it is always where
 * the reader is reading:
 *
 * - with a mouse or trackpad, at the pointer, following a little behind like
 *   a torch carried in the hand, and resting where it was left;
 * - from the keyboard, at whatever has focus;
 * - on a touch screen, held still across the reading line, so the page is
 *   read by scrolling it through the light.
 *
 * Before this has loaded, the same darkness is drawn by the canvas's own CSS
 * background, with the light at the reading line, so the first paint is
 * already the cave; the drawn flame replaces it in a single frame.
 *
 * Readers who ask for more contrast get no darkness at all, and readers who
 * ask for less motion get a light that follows them but does not flicker.
 */
export function Torch() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = context;
    const root = document.documentElement;
    const fine = window.matchMedia(FINE_POINTER);
    const reduced = window.matchMedia(REDUCED_MOTION);
    const moreContrast = window.matchMedia(MORE_CONTRAST);
    const flame = createFlame();

    const readingLine = (): Point => ({ x: innerWidth / 2, y: innerHeight * 0.4 });

    // On arrival the light finds the page's title, if it is on screen, so
    // the first thing the torch shows is the name of the place.
    const arrival = (): Point => {
      const title = document.querySelector("h1")?.getBoundingClientRect();
      if (!fine.matches || !title || title.bottom < 0 || title.top > innerHeight) return readingLine();
      return { x: title.left + Math.min(title.width, 480) / 2, y: title.top + title.height / 2 };
    };
    const reach = () =>
      fine.matches
        ? Math.min(Math.max(innerWidth * 0.25, 280), 390)
        : Math.max(innerWidth * 0.62, 240);

    let following: "reading" | "pointer" | "focus" = "reading";
    // The light starts where the CSS stand-in drew it and is raised to the
    // title, slowly; once the reader moves it, it follows more closely.
    const at = readingLine();
    let target = reduced.matches ? readingLine() : arrival();
    let follow = 3.5;
    let frame = 0;
    let last = 0;
    let drawn = false;

    function resize() {
      canvas!.width = Math.ceil(innerWidth / SCALE);
      canvas!.height = Math.ceil(innerHeight / SCALE);
      if (following === "reading") target = readingLine();
      drawn = false;
    }

    function draw(f: FlameState) {
      const w = canvas!.width;
      const h = canvas!.height;
      const span = reach();
      const R = (span * f.reach) / SCALE;
      const cx = (at.x + f.dx * span) / SCALE;
      const cy = (at.y + f.dy * span) / SCALE;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(${DARK_RGB.join(",")}, ${darknessFor(f.strength)})`;
      ctx.fillRect(0, 0, w, h);

      // Everything from here is drawn in a frame centred on the flame and
      // stretched wide, so the pool is an oval.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(WIDE, TALL);

      // The light, cut out of the dark lobe by lobe.
      ctx.globalCompositeOperation = "destination-out";
      LOBES.forEach((lobe, i) => {
        const lick = f.licks[i] ?? 0;
        const turn = (f.time * Math.PI * 2) / lobe.period;
        const x = (lobe.x + Math.sin(turn + lobe.x * 7) * lobe.wander + lick * 0.4) * R;
        const y = (lobe.y + Math.cos(turn * 0.77 + lobe.y * 5) * lobe.wander - Math.abs(lick) * 0.5) * R;
        const r = lobe.r * R * (1 + lick);
        const a = Math.min(1, lobe.a * f.strength * (1 + lick * 0.5));
        const light = ctx.createRadialGradient(x, y, 0, x, y, r);
        light.addColorStop(0, `rgba(0,0,0,${a})`);
        light.addColorStop(0.5, `rgba(0,0,0,${a * 0.92})`);
        light.addColorStop(0.8, `rgba(0,0,0,${a * 0.4})`);
        light.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = light;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      });

      // Fire's own colour: faintly warm at the heart, deepening to orange
      // where the light gives out, then the cold dark.
      ctx.globalCompositeOperation = "source-over";
      // Its colour wavers between amber and a deeper orange as it burns.
      const heat = Math.max(0, Math.min(1, 0.5 + (f.licks[0] ?? 0) * 4));
      const glow = 0.85 + (f.strength - 0.85) * 1.6;
      const rim = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.2);
      rim.addColorStop(0, `rgba(255,${176 + 20 * heat},${96 + 24 * heat},${0.032 * glow})`);
      rim.addColorStop(0.5, `rgba(255,${136 + 30 * heat},${58 + 20 * heat},${0.05 * glow})`);
      rim.addColorStop(0.78, `rgba(${200 + 26 * heat},${84 + 24 * heat},30,${0.07 * glow})`);
      rim.addColorStop(1, "rgba(120,40,12,0)");
      ctx.fillStyle = rim;
      ctx.fillRect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4);
      ctx.restore();
    }

    function tick(now: number) {
      const dt = last ? (now - last) / 1000 : 1 / 60;
      last = now;
      const ease = 1 - Math.exp(-dt * follow);
      const moving = Math.abs(target.x - at.x) + Math.abs(target.y - at.y) > 0.3;
      at.x += (target.x - at.x) * ease;
      at.y += (target.y - at.y) * ease;
      if (!reduced.matches) draw(flame.step(dt));
      else if (moving || !drawn) draw(STILL);
      if (!drawn) canvas!.setAttribute("data-burning", "");
      drawn = true;
      frame = requestAnimationFrame(tick);
    }

    const lit = () =>
      root.getAttribute("data-theme") === "night" &&
      !moreContrast.matches &&
      document.visibilityState === "visible";

    function update() {
      if (lit() && !frame) {
        last = 0;
        // Resizing clears the canvas: show the CSS dark again until the
        // first frame is drawn, so the page is never lit all over.
        canvas!.removeAttribute("data-burning");
        resize();
        frame = requestAnimationFrame(tick);
      } else if (!lit() && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    function aimAtFocus() {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement) || !el.matches(":focus-visible")) return;
      const box = el.getBoundingClientRect();
      following = "focus";
      follow = 14;
      target = {
        x: Math.min(Math.max(box.left + box.width / 2, 0), innerWidth),
        y: Math.min(Math.max(box.top + box.height / 2, 0), innerHeight),
      };
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !fine.matches) return;
      following = "pointer";
      follow = 14;
      target = { x: event.clientX, y: event.clientY };
    };
    // A focused element the browser scrolls into view keeps the light on it.
    const onScroll = () => {
      if (following === "focus") aimAtFocus();
    };

    const theme = new MutationObserver(update);
    theme.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("focusin", aimAtFocus);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", update);
    moreContrast.addEventListener("change", update);
    update();

    return () => {
      theme.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("focusin", aimAtFocus);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", update);
      moreContrast.removeEventListener("change", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={ref} className={styles.torch} aria-hidden="true" />;
}
