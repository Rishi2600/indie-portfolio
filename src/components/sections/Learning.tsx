import { Yantra } from "@/components/decorative/Yantra";
import { Section } from "@/components/layout/Section";
import { learning, learningNote } from "@/content/learning";
import styles from "./Learning.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A reading index rather than a skills grid: these are things being learned,
 * not things being claimed.
 */
export function Learning() {
  return (
    <Section
      id="learning"
      index="03"
      label="Learning"
      title="Currently learning"
      backdrop={
        <div className={styles.padma}>
          <Yantra rings={3} draw="scroll" stroke={0.55} />
        </div>
      }
    >
      <p className="note">{learningNote}</p>

      <ol className={styles.list}>
        {learning.map((entry, i) => (
          <li key={entry.title} className={styles.entry}>
            <span className="numeral">{pad(i + 1)}</span>
            <h3 className={styles.title}>{entry.title}</h3>
            {entry.note ? (
              <p className={styles.entryNote}>{entry.note}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}
