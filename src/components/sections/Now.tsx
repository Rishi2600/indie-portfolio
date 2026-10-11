import { CavePainting } from "@/components/decorative/CavePainting";
import { Construction } from "@/components/decorative/Construction";
import { Section } from "@/components/layout/Section";
import { profile } from "@/content/profile";
import { chapter } from "@/content/site";
import { formatDate } from "@/lib/time/format";
import styles from "./Now.module.css";

export function Now() {
  const { now } = profile;
  const { numeral, label } = chapter("now");

  return (
    <Section
      id="now"
      index={numeral}
      label={label}
      title={now.title}
      level={1}
      backdrop={<Construction className={styles.construction} />}
    >
      <div className="prose">
        {now.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {/* The date this passage was last rewritten, which is the only date on
          a "now" page that means anything. It is set by hand in content,
          not taken from the build. */}
      <p className={styles.revised}>
        <span className="label">Last rewritten</span>
        <time className={styles.revisedValue} dateTime={now.updated}>
          {formatDate(now.updated)}
        </time>
      </p>
      <CavePainting kind="archers" top="52%" />
    </Section>
  );
}
