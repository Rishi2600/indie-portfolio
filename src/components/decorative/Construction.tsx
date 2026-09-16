import type { CSSProperties } from "react";
import { polar, spoke } from "./geometry";
import styles from "./Yantra.module.css";

/**
 * Compass lines: the construction a yantra is laid out on before any petal
 * is drawn. Quarter arcs struck from a corner, a few radii, and a scale of
 * ticks along one arc — the working-out left faintly in the margin of the
 * page, the way a draughtsman's guidelines survive under the ink.
 *
 * Centred on the top-right corner of its box, so only the lower-left
 * quadrant is ever on the page.
 */

const CX = 200;
const CY = 0;
const ARCS = [44, 76, 108, 140, 172];
const RADII = [198, 222, 246];
const TICKS = Array.from({ length: 19 }, (_, i) => 180 + i * 5);

function quarter(r: number): string {
  const a = polar(CX, CY, r, 180);
  const b = polar(CX, CY, r, 270);
  return `M${a.x} ${a.y}A${r} ${r} 0 0 1 ${b.x} ${b.y}`;
}

export function Construction({
  className,
  stroke = 0.6,
}: {
  className?: string;
  stroke?: number;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={[styles.yantra, styles.onScroll, className]
        .filter(Boolean)
        .join(" ")}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.ring} style={{ "--ring": 0 } as CSSProperties}>
        {ARCS.map((r) => (
          <path key={r} d={quarter(r)} pathLength={1} />
        ))}
      </g>
      <g className={styles.ring} style={{ "--ring": 2 } as CSSProperties}>
        {RADII.map((deg) => (
          <path key={deg} d={spoke(CX, CY, 20, 190, deg)} pathLength={1} />
        ))}
      </g>
      <g className={styles.ring} style={{ "--ring": 4 } as CSSProperties}>
        {TICKS.map((deg) => (
          <path
            key={deg}
            d={spoke(CX, CY, 106, deg % 15 === 0 ? 114 : 111, deg)}
            pathLength={1}
          />
        ))}
      </g>
    </svg>
  );
}
