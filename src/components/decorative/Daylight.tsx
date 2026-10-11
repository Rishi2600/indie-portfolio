"use client";

import { useEffect, useRef } from "react";
import { BIRD, BIRD_BOX } from "@/lib/bird";
import type { ReliefTile } from "@/lib/rock";
import {
  BAR_SHADE,
  BIRD_SHADE,
  castBy,
  paperShading,
  ROOM_SHADE,
  shadowOffset,
  sunAt,
  type Cast,
  type Sun,
} from "@/lib/sun";
import styles from "./Daylight.module.css";

/** Shade is soft-edged, so it is drawn at half the screen's resolution. */
const SCALE = 0.5;
/** How wide one tile of the paper's relief is laid on the page, in pixels. */
const PAPER_PX = 420;
/** How often the sun is looked at again: it moves too slowly to need more. */
const SUN_EVERY_MS = 120_000;
/** One cell of the jaali's lattice, as it falls on the page, in pixels. */
const CELL = 86;
/**
 * The book never lies quite square to the window, so the lattice's shadow is
 * turned a little on the page and never lines up with the screen's edges.
 */
const DESK_TURN = (11 * Math.PI) / 180;
/** How far above the page a bird flies, for the length of its shadow. */
const BIRD_HEIGHT = 40;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const MORE_CONTRAST = "(prefers-contrast: more)";

/** The paper's relief, made once per page in a worker. */
let paper: Promise<ReliefTile | null> | undefined;
function paperRelief() {
  paper ??= new Promise((resolve) => {
    try {
      const worker = new Worker(new URL("./daylight.worker.ts", import.meta.url));
      worker.onmessage = (event) => {
        resolve(event.data);
        worker.terminate();
      };
      worker.onerror = () => {
        resolve(null);
        worker.terminate();
      };
    } catch {
      resolve(null);
    }
  });
  return paper;
}

/** An eight-pointed star: the opening of the jaali, two squares turned on each other. */
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  for (const turn of [0, Math.PI / 4]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    ctx.rect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }
}

/**
 * The patch of sun the window throws on the page, and the jaali's shadow in
 * it: the room's shade everywhere else, the lattice's bars as shade inside,
 * the star-shaped openings as full sun. Drawn once for the sun's position,
 * fixed to the window rather than the page, so the page scrolls under it.
 */
function drawWindow(target: HTMLCanvasElement, cast: Cast) {
  const w = target.width;
  const h = target.height;
  const ctx = target.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const angle = Math.atan2(cast.toward.y, cast.toward.x);
  // The patch lies a little away from the window, on the shadow side.
  const cx = w / 2 - cast.toward.x * w * 0.12;
  const cy = h * 0.46 - cast.toward.y * h * 0.1;
  const halfW = w * 0.4;
  const halfH = h * 0.42;
  const soft = cast.softness * SCALE;

  function inPatch(draw: () => void) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    // Shadows stretch along the line of the sun.
    ctx.scale(cast.stretch, 1);
    ctx.rotate(-angle);
    draw();
    ctx.restore();
  }

  // The room's shade, with the patch of sun cut out of it.
  ctx.fillStyle = `rgba(0,0,0,${ROOM_SHADE})`;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "destination-out";
  ctx.filter = `blur(${soft * 4}px)`;
  inPatch(() => {
    ctx.beginPath();
    ctx.roundRect(-halfW / cast.stretch, -halfH, (halfW * 2) / cast.stretch, halfH * 2, 18);
    ctx.fillStyle = "#000";
    ctx.fill();
  });

  // The lattice: bars of shade across the patch, openings of full sun.
  const bars = document.createElement("canvas");
  bars.width = w;
  bars.height = h;
  const b = bars.getContext("2d")!;
  b.save();
  b.translate(cx, cy);
  b.rotate(angle);
  b.scale(cast.stretch, 1);
  b.rotate(-angle);
  b.beginPath();
  b.roundRect(-halfW / cast.stretch, -halfH, (halfW * 2) / cast.stretch, halfH * 2, 18);
  b.fillStyle = `rgba(0,0,0,${BAR_SHADE})`;
  b.filter = `blur(${soft * 2}px)`;
  b.fill();
  b.globalCompositeOperation = "destination-out";
  b.filter = `blur(${soft}px)`;
  b.rotate(DESK_TURN);
  b.beginPath();
  const cell = CELL * SCALE;
  const reach = Math.hypot(halfW, halfH) + cell;
  for (let y = -reach; y <= reach; y += cell) {
    for (let x = -reach; x <= reach; x += cell) {
      star(b, x, y, cell * 0.34);
      // A small diamond where four cells meet.
      b.moveTo(x + cell / 2, y + cell / 2 - cell * 0.08);
      b.lineTo(x + cell / 2 + cell * 0.08, y + cell / 2);
      b.lineTo(x + cell / 2, y + cell / 2 + cell * 0.08);
      b.lineTo(x + cell / 2 - cell * 0.08, y + cell / 2);
      b.closePath();
    }
  }
  b.fillStyle = "#000";
  b.fill();
  b.restore();

  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  ctx.drawImage(bars, 0, 0);
}

/** The paper's relief as a tile of shade, lit from where the sun is. */
function paperTile(tile: ReliefTile, sun: Sun): HTMLCanvasElement {
  const alpha = paperShading(tile.data, sun);
  const canvas = document.createElement("canvas");
  canvas.width = tile.size;
  canvas.height = tile.size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(tile.size, tile.size);
  for (let k = 0; k < alpha.length; k++) image.data[k * 4 + 3] = alpha[k]!;
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/**
 * Gold leaf on the masthead's mark and the page's corner rosettes: a glint
 * crosses it as the page is scrolled, as gilding catches the light when a
 * page is tilted towards a window. Readers who ask for less motion get the
 * gold still.
 */
function gild(still: boolean) {
  // At the top of the page the glint is across the middle of the mark.
  const at = still ? 0.35 : (((scrollY / 900 + 0.35) % 1) + 1) % 1;
  for (const gradient of document.querySelectorAll<SVGLinearGradientElement>("linearGradient[data-glint]")) {
    const stops = gradient.querySelectorAll("stop");
    const offsets = [0, at - 0.18, at, at + 0.18, 1].map((o) => Math.min(Math.max(o, 0), 1));
    stops.forEach((stop, i) => stop.setAttribute("offset", String(offsets[i] ?? 1)));
  }
}

/**
 * Daylight, by day.
 *
 * The page is a leaf of an old book on a reading desk, lit by the real sun
 * over India through a carved stone jaali (lib/sun.ts). The window throws a
 * patch of sun on the page, crossed by the lattice's shadow; outside it the
 * page is in the room's shade. The paper itself is not flat: its waves and
 * fibres catch the sun on one side and fall into shade on the other. A bird
 * crossing the sky throws its shadow across the page.
 *
 * All of it is shade, never colour: where the sun falls full the paper is
 * exactly --paper, and the shade is capped so the writing keeps its contrast
 * (sun.test.ts). It is laid over the page like a real shadow, writing and
 * all, and redrawn only when something moves: the page scrolling, a bird
 * crossing, or the sun, looked at every two minutes.
 *
 * Readers who ask for more contrast, high-contrast modes and print get the
 * plain page.
 */
export function Daylight() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = context;
    const root = document.documentElement;
    const reduced = window.matchMedia(REDUCED_MOTION);
    const moreContrast = window.matchMedia(MORE_CONTRAST);

    const window_ = document.createElement("canvas");
    let sun: Sun = sunAt(new Date());
    let cast = castBy(sun);
    let relief: ReliefTile | null = null;
    let paperPattern: CanvasPattern | null = null;
    let frame = 0;
    let sunTimer: ReturnType<typeof setInterval> | undefined;
    let gone = false;

    // A bird's shadow, made once: its silhouette a little bolder than the
    // bird, as a shadow is, solid, so it can be laid down at exactly
    // BIRD_SHADE. Drawn small, the wings would be too thin to see.
    const birdShadow = document.createElement("canvas");
    birdShadow.width = BIRD_BOX.width * 3;
    birdShadow.height = BIRD_BOX.height * 3;
    {
      const g = birdShadow.getContext("2d")!;
      g.scale(3, 3);
      const shape = new Path2D();
      shape.addPath(new Path2D(BIRD.farWing));
      shape.addPath(new Path2D(BIRD.body));
      shape.addPath(new Path2D(BIRD.nearWing));
      shape.addPath(new Path2D(BIRD.tail));
      shape.arc(BIRD.head.cx, BIRD.head.cy, BIRD.head.r + 0.4, 0, Math.PI * 2);
      g.fillStyle = "#000";
      g.strokeStyle = "#000";
      g.lineWidth = 1.4;
      g.lineJoin = "round";
      g.fill(shape);
      g.stroke(shape);
    }

    function rebuild() {
      canvas!.width = Math.ceil(innerWidth * SCALE);
      canvas!.height = Math.ceil(innerHeight * SCALE);
      window_.width = canvas!.width;
      window_.height = canvas!.height;
      drawWindow(window_, cast);
      paperPattern = relief ? ctx.createPattern(paperTile(relief, sun), "repeat") : null;
    }

    function draw() {
      frame = 0;
      const w = canvas!.width;
      const h = canvas!.height;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(window_, 0, 0);

      // The paper's relief moves with the page; the window's light does not.
      if (paperPattern) {
        const k = (PAPER_PX * SCALE) / (relief?.size ?? 256);
        paperPattern.setTransform(new DOMMatrix().translate(0, -scrollY * SCALE).scale(k));
        ctx.fillStyle = paperPattern;
        ctx.fillRect(0, 0, w, h);
      }

      // A bird's shadow, offset from it away from the sun and softened by
      // the distance it falls.
      const birds = document.querySelectorAll<SVGSVGElement>("svg[data-bird]");
      if (birds.length > 0) {
        const offset = shadowOffset(cast, BIRD_HEIGHT);
        ctx.save();
        ctx.globalAlpha = BIRD_SHADE;
        for (const bird of birds) {
          const box = bird.getBoundingClientRect();
          if (box.width === 0) continue;
          const mirrored = getComputedStyle(bird).scale.startsWith("-1");
          ctx.save();
          ctx.translate((box.left + offset.x) * SCALE, (box.top + offset.y) * SCALE);
          if (mirrored) {
            ctx.translate(box.width * SCALE, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(birdShadow, 0, 0, box.width * SCALE, box.height * SCALE);
          ctx.restore();
        }
        ctx.restore();
        // Birds keep flying: keep drawing while any is in the sky.
        frame = requestAnimationFrame(draw);
      }

      gild(reduced.matches);
      canvas!.setAttribute("data-ready", "");
    }

    const queue = () => {
      if (!frame && lit()) frame = requestAnimationFrame(draw);
    };

    const lit = () =>
      root.getAttribute("data-theme") === "day" &&
      !moreContrast.matches &&
      document.visibilityState === "visible";

    function lookAtTheSun() {
      const next = sunAt(new Date());
      if (Math.abs(next.elevation - sun.elevation) + Math.abs(next.azimuth - sun.azimuth) < 0.2) return;
      sun = next;
      cast = castBy(sun);
      rebuild();
      queue();
    }

    function update() {
      if (lit()) {
        if (!sunTimer) {
          sun = sunAt(new Date());
          cast = castBy(sun);
          rebuild();
          sunTimer = setInterval(lookAtTheSun, SUN_EVERY_MS);
        }
        queue();
      } else {
        if (sunTimer) clearInterval(sunTimer);
        sunTimer = undefined;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    // A bird coming into the sky (Birds adds its sky to the body) starts the
    // drawing again. Only the body's own children are watched, so the clock
    // ticking elsewhere does not.
    const sky = new MutationObserver(queue);
    sky.observe(document.body, { childList: true });

    void paperRelief().then((tile) => {
      if (gone || !tile) return;
      relief = tile;
      if (lit()) {
        rebuild();
        queue();
      }
    });

    const theme = new MutationObserver(update);
    theme.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    const onResize = () => {
      rebuild();
      queue();
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", update);
    moreContrast.addEventListener("change", update);
    update();

    return () => {
      gone = true;
      sky.disconnect();
      theme.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", update);
      moreContrast.removeEventListener("change", update);
      if (sunTimer) clearInterval(sunTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={ref} className={styles.daylight} aria-hidden="true" />;
}
