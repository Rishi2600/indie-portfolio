const CENTRE = 12;
/** The same petal as the mandala's, at four-fold symmetry instead of eight. */
const PETAL = "M12 12 C9.6 8.4 9.6 5.4 12 3 C14.4 5.4 14.4 8.4 12 12 Z";
const ANGLES = [0, 90, 180, 270];

type Props = {
  size: number;
  className?: string;
};

/**
 * The small mark: a four-petalled knot, the padma reduced to what survives
 * at text size. It closes the page, caps the margin rules, and marks the one
 * sentence on the site that is set as a principle. Always decorative.
 */
export function Rosette({ size, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ANGLES.map((angle) => (
        <path
          key={angle}
          d={PETAL}
          transform={`rotate(${angle} 12 12)`}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <circle
        cx={CENTRE}
        cy={CENTRE}
        r="1.1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
