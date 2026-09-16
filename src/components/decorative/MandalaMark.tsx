/**
 * The site's mark: an eight-fold rosette, constructed rather than drawn.
 *
 * Eight-fold radial symmetry — the ashtadala padma, the eight-petalled lotus —
 * is the commonest figure in Indian ornament, from temple plans to the corner
 * medallions of a manuscript page. Here it is reduced to hairlines so it reads
 * as a printer's mark rather than as decoration.
 *
 * Every coordinate below is derived from the geometry, so changing PETALS
 * changes the whole figure and nothing has to be redrawn by hand.
 */

const PETALS = 8;
const CENTRE = 32;
const DOT_RADIUS = 24.5;

/** One petal, pointing up from the centre, with its tip at r = 22. */
const PETAL = `M${CENTRE} ${CENTRE} C27 24 27 15 32 10 C37 15 37 24 32 ${CENTRE} Z`;

const petalAngles = Array.from({ length: PETALS }, (_, i) => (i * 360) / PETALS);

/** Points in the gaps between petal tips, at half a petal's spacing. */
const dots = petalAngles.map((angle) => {
  const radians = ((angle + 180 / PETALS) * Math.PI) / 180;
  return {
    angle,
    x: CENTRE + DOT_RADIUS * Math.cos(radians),
    y: CENTRE + DOT_RADIUS * Math.sin(radians),
  };
});

type Props = {
  size?: number;
  className?: string;
  /**
   * "simple" drops the inner ring and the scatter of dots. Below roughly
   * 24px the full figure fills in and stops reading as a rosette, so the
   * favicon and the small marks use this.
   */
  detail?: "full" | "simple";
  /** Supplying a title makes the mark an image; without one it is hidden. */
  title?: string;
};

export function MandalaMark({
  size = 20,
  className,
  detail = "full",
  title,
}: Props) {
  // vectorEffect holds the stroke at a constant device width instead of
  // letting it scale with the figure, so it is the same pen at every size: a
  // hairline in the masthead and a hairline in a watermark twelve times
  // larger. Without it the small marks thin to sub-pixel and grey out, and
  // the large ones thicken into something drawn rather than ruled. It is not
  // an inherited property, so every stroked shape below names it.
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={detail === "simple" ? 2 : 1.25}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      {...(title ? { role: "img" } : { "aria-hidden": true })}
    >
      {title ? <title>{title}</title> : null}
      <circle cx={CENTRE} cy={CENTRE} r="27" vectorEffect="non-scaling-stroke" />
      {petalAngles.map((angle) => (
        <path
          key={angle}
          d={PETAL}
          transform={`rotate(${angle} 32 32)`}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {detail === "full" ? (
        <>
          <circle cx={CENTRE} cy={CENTRE} r="9" vectorEffect="non-scaling-stroke" />
          {dots.map((dot) => (
            <circle
              key={dot.angle}
              cx={dot.x.toFixed(2)}
              cy={dot.y.toFixed(2)}
              r="0.9"
              fill="currentColor"
              stroke="none"
            />
          ))}
        </>
      ) : null}
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r="2.4"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
