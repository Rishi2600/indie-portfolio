import { Section } from "@/components/layout/Section";
import { profile } from "@/content/profile";
import { formatDate } from "@/lib/time/format";
import styles from "./Now.module.css";

export function Now() {
  const { now } = profile;

  return (
    <Section id="now" index="01" label="Now" title={now.title}>
      <div className="prose">
        {now.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <dl className={styles.facts}>
        {now.facts.map((fact) => (
          <div key={fact.term} className={styles.fact}>
            <dt className="label">{fact.term}</dt>
            <dd className={styles.value}>{fact.value}</dd>
          </div>
        ))}
      </dl>

      {/* The date this passage was last rewritten, which is the only date on
          a "now" section that means anything. It is set by hand in content,
          not taken from the build. */}
      <p className={styles.revised}>
        <span className="label">Last revised</span>
        <time className={styles.revisedValue} dateTime={now.updated}>
          {formatDate(now.updated)}
        </time>
      </p>
    </Section>
  );
}
