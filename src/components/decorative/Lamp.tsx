"use client";

import { useEffect, useRef } from "react";
import styles from "./Lamp.module.css";

/** A pointer that hovers precisely: a mouse or a trackpad, not a finger. */
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * At night, a reader with a mouse carries a small flame.
 *
 * The light is laid on the paper, beneath the text, so words stay exactly as
 * crisp as they were; it warms the sheet where it falls and lifts the faint
 * figures behind the sections, which come up inside the light and nowhere
 * else (base.css). The page never depends on it: by day, on a touch screen,
 * or from the keyboard there is no lamp, and nothing is missing.
 *
 * It is lit by an attribute on <html> when the pointer moves, fades out
 * when the pointer leaves the window, and goes out whenever night ends.
 * Position is written straight to the lamp's transform once a frame, and
 * each lit figure is told where the light is relative to itself, so nothing
 * else on the page restyles as it moves. The flame's own slow life is CSS,
 * and stops under reduced motion.
 */
export function Lamp() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lamp = ref.current;
    if (!lamp || !window.matchMedia(FINE_POINTER).matches) return;

    const root = document.documentElement;
    let x = 0;
    let y = 0;
    let frame = 0;

    function paint() {
      frame = 0;
      const figures = document.querySelectorAll<HTMLElement>("[data-lit] > *");
      // Read every position first, then write, so the frame lays out once.
      const boxes = Array.from(figures, (figure) => figure.getBoundingClientRect());
      lamp!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      figures.forEach((figure, i) => {
        const box = boxes[i]!;
        figure.style.setProperty("--lamp-fx", `${x - box.left}px`);
        figure.style.setProperty("--lamp-fy", `${y - box.top}px`);
      });
    }

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (root.getAttribute("data-theme") === "night") {
        if (root.getAttribute("data-lamp") !== "on") root.setAttribute("data-lamp", "on");
        queue();
      }
    };

    const putOut = () => root.removeAttribute("data-lamp");

    // Day has no lamp: when night ends, the lamp goes out with it.
    const night = new MutationObserver(() => {
      if (root.getAttribute("data-theme") !== "night") putOut();
    });
    night.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    root.addEventListener("pointerleave", putOut);
    window.addEventListener("blur", putOut);

    return () => {
      night.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", queue);
      root.removeEventListener("pointerleave", putOut);
      window.removeEventListener("blur", putOut);
      if (frame) cancelAnimationFrame(frame);
      putOut();
    };
  }, []);

  return (
    <div ref={ref} className={styles.lamp} aria-hidden="true">
      <span className={styles.pool} />
      <span className={styles.core} />
    </div>
  );
}
