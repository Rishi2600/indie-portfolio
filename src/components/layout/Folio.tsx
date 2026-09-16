import type { ReactNode } from "react";
import styles from "./Folio.module.css";

/**
 * The ruled page everything on the site sits inside. There is exactly one,
 * wrapping masthead, contents and colophon together, so the side rules are
 * continuous rather than restarting at each band.
 */
export function Folio({ children }: { children: ReactNode }) {
  return <div className={styles.folio}>{children}</div>;
}
