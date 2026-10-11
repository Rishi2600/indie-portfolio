import type { CSSProperties, ReactNode } from "react";
import styles from "./CavePainting.module.css";

/**
 * Paintings on the cave wall, in the manner of the rock shelters at
 * Bhimbetka: animals, archers, dancers and hands, drawn in red ochre with a
 * few strokes and worn patchy by time.
 *
 * They are on the wall only at night, and only the torch finds them: away
 * from its direct light they cannot be seen at all, not even in its
 * afterglow (Torch.tsx tells each one where the light is). They sit in the
 * open stone beside a section, never behind its writing, and only on screens
 * wide enough to have that stone; on narrower ones there are none.
 *
 * Decoration only: hidden from assistive technology, and nothing on the page
 * depends on finding them.
 */

export type PaintingKind = "archers" | "bison" | "deer" | "dancers" | "hands";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** An archer drawing a bow, facing right, feet at (x, y). */
function archer(x: number, y: number) {
  return (
    <g key={`${x},${y}`}>
      <circle cx={x + 2} cy={y - 39} r={4.5} fill="currentColor" />
      <path d={`M${x - 4} ${y - 33}L${x + 6} ${y - 33}L${x} ${y - 17}Z`} fill="currentColor" />
      <path
        {...STROKE}
        d={
          `M${x} ${y - 17}L${x + 10} ${y}M${x} ${y - 17}L${x - 9} ${y - 1}` +
          `M${x + 4} ${y - 31}L${x + 14} ${y - 28}M${x - 2} ${y - 31}L${x + 6} ${y - 27}` +
          `M${x + 13} ${y - 41}Q${x + 23} ${y - 28} ${x + 13} ${y - 14}` +
          `M${x + 13} ${y - 41}L${x + 6} ${y - 27}L${x + 13} ${y - 14}` +
          `M${x + 6} ${y - 27}L${x + 33} ${y - 27}M${x + 33} ${y - 27}l-5 -3M${x + 33} ${y - 27}l-5 3`
        }
      />
    </g>
  );
}

/** A deer, facing right, its back at (x, y). */
function deer(x: number, y: number, scale = 1) {
  return (
    <g key={`${x},${y}`} transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 0C4 -8 30 -10 44 -6C50 -4 52 4 46 8C30 12 8 12 2 8Z"
        fill="currentColor"
        fillOpacity={0.4}
        stroke="currentColor"
        strokeWidth={2}
      />
      <path d="M42 -4L52 -20L61 -18L56 -13L48 -1Z" fill="currentColor" />
      <path
        {...STROKE}
        d={
          "M12 -7L10 9M22 -8L20 10M32 -7L31 9" +
          "M52 -20L48 -33M50 -27L43 -31M49 -30L52 -37M55 -20L58 -32M57 -27L63 -30" +
          "M8 9L5 30M14 10L16 31M38 9L36 30M44 7L48 29M1 1L-5 -3"
        }
      />
    </g>
  );
}

/** A dancer with raised arms, feet at (x, y); neighbours' hands meet. */
function dancer(x: number, y: number) {
  return (
    <g key={x}>
      <circle cx={x} cy={y - 56} r={5} fill="currentColor" />
      <path d={`M${x - 7} ${y - 48}L${x + 7} ${y - 48}L${x} ${y - 26}Z`} fill="currentColor" />
      <path
        {...STROKE}
        d={
          `M${x} ${y - 26}L${x - 8} ${y}M${x} ${y - 26}L${x + 8} ${y}` +
          `M${x - 6} ${y - 47}L${x - 14} ${y - 60}M${x + 6} ${y - 47}L${x + 14} ${y - 60}`
        }
      />
    </g>
  );
}

/** A hand, palm at (x, y), turned by `turn` degrees. */
function hand(x: number, y: number, turn: number, fade = 1) {
  return (
    <g key={`${x},${y}`} transform={`translate(${x} ${y}) rotate(${turn})`} opacity={fade}>
      <ellipse cx={0} cy={6} rx={13} ry={16} fill="currentColor" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={7}
        strokeLinecap="round"
        d="M-12 6L-23 -4M-7 -8L-9 -27M-1 -10L-1 -31M5 -9L7 -28M10 -5L14 -20"
      />
    </g>
  );
}

const MOTIFS: Record<PaintingKind, { viewBox: string; art: ReactNode }> = {
  archers: {
    viewBox: "0 0 150 110",
    art: [archer(30, 100), archer(80, 92), archer(112, 104)],
  },
  bison: {
    viewBox: "0 0 200 120",
    art: (
      <>
        <clipPath id="bison-body">
          <path d="M40 52C46 40 64 34 84 36C96 26 116 24 128 32C140 30 152 34 158 44L170 50C172 56 168 62 160 62C154 70 146 74 138 74C132 82 120 86 104 86C84 88 62 86 50 80C40 76 36 66 40 52Z" />
        </clipPath>
        <path
          d="M40 52C46 40 64 34 84 36C96 26 116 24 128 32C140 30 152 34 158 44L170 50C172 56 168 62 160 62C154 70 146 74 138 74C132 82 120 86 104 86C84 88 62 86 50 80C40 76 36 66 40 52Z"
          fill="currentColor"
          fillOpacity={0.3}
          stroke="currentColor"
          strokeWidth={2.6}
        />
        {/* The body filled with crossed lines, as the shelters' animals often are. */}
        <g clipPath="url(#bison-body)" {...STROKE} strokeWidth={1.6}>
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M${30 + i * 13} 90L${60 + i * 13} 20M${60 + i * 13} 90L${30 + i * 13} 20`} />
          ))}
        </g>
        <circle cx={160} cy={47} r={2} fill="currentColor" />
        <path
          {...STROKE}
          strokeWidth={2.6}
          d="M150 36C148 24 156 16 166 18M138 32C132 22 136 14 144 12M42 58C30 60 26 72 30 84M60 82L56 108M72 85L74 110M124 82L120 108M138 76L142 104"
        />
      </>
    ),
  },
  deer: {
    viewBox: "0 0 190 110",
    art: [deer(18, 52), deer(96, 66, 0.85), deer(124, 30, 0.7)],
  },
  dancers: {
    viewBox: "0 0 170 120",
    art: [26, 54, 82, 110, 138].map((x) => dancer(x, 112)),
  },
  hands: {
    viewBox: "0 0 170 120",
    art: [hand(36, 70, -16), hand(88, 56, 6, 0.85), hand(138, 74, -4, 0.6)],
  },
};

export function CavePainting({
  kind,
  top,
  width = "9rem",
}: {
  kind: PaintingKind;
  /** How far down the section it is painted, as a CSS length. */
  top: string;
  width?: string;
}) {
  const { viewBox, art } = MOTIFS[kind];
  const wear = `wear-${kind}`;
  return (
    <div
      className={styles.painting}
      data-painting=""
      aria-hidden="true"
      style={{ "--top": top, "--width": width } as CSSProperties}
    >
      <svg viewBox={viewBox} className={styles.art} focusable="false">
        {/* Worn by time: edges roughened, and patches of paint gone. */}
        <filter id={wear} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grit" />
          <feDisplacementMap in="SourceGraphic" in2="grit" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="9" result="patches" />
          <feColorMatrix in="patches" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2.6 -0.75" result="kept" />
          <feComposite in="rough" in2="kept" operator="in" />
        </filter>
        <g filter={`url(#${wear})`}>{art}</g>
      </svg>
    </div>
  );
}
