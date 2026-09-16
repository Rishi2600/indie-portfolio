import { Rosette } from "./Rosette";
import styles from "./SectionDivider.module.css";

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
        <Rosette size={15} />
        <Rosette size={22} />
        <Rosette size={15} />
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
