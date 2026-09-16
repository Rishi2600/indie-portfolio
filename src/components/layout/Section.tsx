import type { ReactNode } from "react";
import styles from "./Section.module.css";

type Props = {
  /** Also the anchor the navigation points at. */
  id: string;
  /** Two digits, rubricated, in the margin. */
  index: string;
  /** The short name in the margin, beside the numeral. */
  label: string;
  /** The heading. Every section has one; it is what names the landmark. */
  title: string;
  children: ReactNode;
};

export function Section({ id, index, label, title, children }: Props) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${styles.section} enter`}
    >
      <div className={styles.rail}>
        <span className="numeral">{index}</span>
        <span className="label">{label}</span>
      </div>

      <div>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
