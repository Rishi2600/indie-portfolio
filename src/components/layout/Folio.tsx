import type { ReactNode } from "react";
import { Rosette } from "@/components/decorative/Rosette";
import styles from "./Folio.module.css";

const FINIALS = [
  styles.topLeft,
  styles.topRight,
  styles.bottomLeft,
  styles.bottomRight,
];

/**
 * The ruled page everything on the site sits inside. There is exactly one,
 * wrapping masthead, contents and colophon together, so the side rules are
 * continuous rather than restarting at each band. On wide screens each rule
 * ends in a small rosette, the way a scribe finishes a ruled border.
 */
export function Folio({ children }: { children: ReactNode }) {
  return (
    <div className={styles.folio}>
      {FINIALS.map((position) => (
        <span
          key={position}
          className={`${styles.finial} ${position}`}
          aria-hidden="true"
        >
          <Rosette size={11} />
        </span>
      ))}
      {children}
    </div>
  );
}
