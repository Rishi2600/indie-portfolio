import type { ReactNode } from "react";
import styles from "./Backdrop.module.css";

/**
 * Purely decorative, so the whole layer is removed from the accessibility
 * tree. Its figures (`data-lit`) are carvings on the cave wall at night,
 * where they show more strongly; each states its resting strength as
 * --figure-opacity.
 */
export function Backdrop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.backdrop} aria-hidden="true" data-lit="">
      {children}
    </div>
  );
}
