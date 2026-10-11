import { CavePainting } from "@/components/decorative/CavePainting";
import { Yantra } from "@/components/decorative/Yantra";
import { Section } from "@/components/layout/Section";
import { learning, learningNote } from "@/content/learning";
import { chapter } from "@/content/site";
import styles from "./Learning.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A reading index rather than a skills grid: these are things being learned,
 * not things being claimed. It is the second half of the now page, and its
 * numeral says so.
 */
export function Learning() {
  return (
    <Section
      id="learning"
      index={`${chapter("now").numeral}.1`}
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
      <CavePainting kind="deer" top="38%" />
    </Section>
  );
}
