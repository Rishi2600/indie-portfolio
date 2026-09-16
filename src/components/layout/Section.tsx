import { Backdrop } from "@/components/decorative/Backdrop";
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
  /** An ornament drawn behind the section, cut by the page margin. */
  backdrop?: ReactNode;
  children: ReactNode;
};

export function Section({
  id,
  index,
  label,
  title,
  backdrop,
  children,
}: Props) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${styles.section} enter`}
    >
      {backdrop ? <Backdrop>{backdrop}</Backdrop> : null}
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
