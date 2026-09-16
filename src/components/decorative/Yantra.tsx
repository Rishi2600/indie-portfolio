import type { CSSProperties } from "react";
import { C, RINGS, strokeOf } from "./yantra-figure";
import styles from "./Yantra.module.css";

/**
 * The site's mark grown outward into a full figure.
 *
 * At its centre is the same ashtadala padma as the masthead's rosette. Around
 * it, ring by ring, the figure is built the way one is laid out with a
 * compass: a circle, a second lotus of sixteen petals, a ring of points, a
 * band of fine spokes, a scalloped border, and a double rule to close it —
 * the same double rule the page itself is ruled with.
 *
 * Each ring can be drawn in, in order from the centre, which is the whole of
 * its motion: the figure is constructed in front of the reader rather than
 * faded in. `rings` stops the construction early for a quieter figure.
 */

type Props = {
  className?: string;
  /** How many rings to build, from the centre. */
  rings?: number;
  /**
   * The figure's stroke in its own 200-unit space. Strokes here scale with
   * the figure — they have to, for the drawing to work — so a figure meant to
   * render around 400px wants about 0.5 to land near a one-pixel line.
   */
  stroke?: number;
  /** "load" draws once when the page opens; "scroll" as the figure is scrolled into view. */
  draw?: "load" | "scroll" | "none";
};

export function Yantra({
  className,
  rings = RINGS.length,
  stroke = 0.5,
  draw = "none",
}: Props) {
  const drawClass =
    draw === "load" ? styles.onLoad : draw === "scroll" ? styles.onScroll : "";

  return (
    <svg
      viewBox="0 0 200 200"
      className={[styles.yantra, drawClass, className].filter(Boolean).join(" ")}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {RINGS.slice(0, rings).map((ring, index) => (
        <g
          key={index}
          className={styles.ring}
          style={{ "--ring": index } as CSSProperties}
        >
          {ring.circles?.map((r) => (
            <circle key={r} cx={C} cy={C} r={r} pathLength={1} />
          ))}
          {ring.strokes.map((entry) => {
            const { d, deg } = strokeOf(entry);
            return (
              <path
                key={entry}
                d={d}
                pathLength={1}
                transform={deg ? `rotate(${deg} ${C} ${C})` : undefined}
              />
            );
          })}
          {ring.dots?.map((dot) => (
            <circle
              key={`${dot.x},${dot.y}`}
              className={styles.dot}
              cx={dot.x}
              cy={dot.y}
              r={ring.dotRadius ?? 0.9}
              fill="currentColor"
              stroke="none"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
