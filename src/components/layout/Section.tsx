import { Backdrop } from "@/components/decorative/Backdrop";
import type { ReactNode } from "react";
import styles from "./Section.module.css";
import { SectionLink } from "./SectionLink";

type Props = {
  /** Also the anchor the navigation points at. */
  id: string;
  /** Two digits, rubricated, in the margin. */
  index: string;
  /** The short name in the margin, beside the numeral. */
  label: string;
  /** The heading. Every section has one; it is what names the landmark. */
  title: string;
  /**
   * 2 for a section of the home page, which already has its h1 in the
   * opening. 1 for a page whose only content is one section.
   */
  level?: 1 | 2;
  /** An ornament drawn behind the section, cut by the page margin. */
  backdrop?: ReactNode;
  children: ReactNode;
};

export function Section({
  id,
  index,
  label,
  title,
  level = 2,
  backdrop,
  children,
}: Props) {
  const headingId = `${id}-title`;
  const Heading = level === 1 ? "h1" : "h2";

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
        <div className={styles.heading}>
          <Heading id={headingId} className={styles.title}>
            {title}
          </Heading>
          <span className={styles.anchor}>
            <SectionLink id={id} title={title} />
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}
