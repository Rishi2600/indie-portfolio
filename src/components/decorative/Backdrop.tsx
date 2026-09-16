import type { ReactNode } from "react";
import styles from "./Backdrop.module.css";

/** Purely decorative, so the whole layer is removed from the accessibility tree. */
export function Backdrop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      {children}
    </div>
  );
}
