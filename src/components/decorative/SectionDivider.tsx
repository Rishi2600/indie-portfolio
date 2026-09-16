import styles from "./SectionDivider.module.css";

const CENTRE = 12;
/** The same petal as the mandala's, at four-fold symmetry instead of eight. */
const PETAL = "M12 12 C9.6 8.4 9.6 5.4 12 3 C14.4 5.4 14.4 8.4 12 12 Z";
const ANGLES = [0, 90, 180, 270];

function Rosette({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ANGLES.map((angle) => (
        <path key={angle} d={PETAL} transform={`rotate(${angle} 12 12)`} />
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

type Props = {
  /**
   * "ornament" divides two passages of the same page. "terminal" closes the
   * page, and is the only mark on the site that sits alone.
   */
  variant?: "ornament" | "terminal";
  className?: string;
};

export function SectionDivider({ variant = "ornament", className }: Props) {
  if (variant === "terminal") {
    return (
      <div
        className={[styles.terminal, className].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
        <Rosette size={10} />
        <Rosette size={15} />
        <Rosette size={10} />
      </div>
    );
  }

  return (
    <div
      className={[styles.divider, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <span className={styles.line} />
      <Rosette size={14} />
      <span className={styles.line} />
    </div>
  );
}
