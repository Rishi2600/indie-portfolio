import styles from "./PaperGrain.module.css";

/**
 * The paper itself. Purely presentational, so it is hidden from assistive
 * technology and sits behind the app shell's stacking context.
 */
export function PaperGrain() {
  return (
    <>
      <div className={`${styles.layer} ${styles.grain}`} aria-hidden="true" />
      <div className={`${styles.layer} ${styles.shade}`} aria-hidden="true" />
    </>
  );
}
