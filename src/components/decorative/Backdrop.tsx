import type { ReactNode } from "react";
import styles from "./Backdrop.module.css";

/**
 * Purely decorative, so the whole layer is removed from the accessibility
 * tree. Its figures are the ones the lamp lights at night (`data-lit`); each
 * states its resting strength as --figure-opacity.
 */
export function Backdrop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.backdrop} aria-hidden="true" data-lit="">
      {children}
    </div>
  );
}
