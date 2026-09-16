import { Section } from "@/components/layout/Section";
import { notes, notesIntro } from "@/content/notes";
import { formatDate } from "@/lib/time/format";
import styles from "./Notes.module.css";

export function Notes() {
  return (
    <Section id="notes" index="06" label="Notes" title="Notes">
      <p className={styles.intro}>{notesIntro}</p>

      {notes.length > 0 ? (
        <ol className={styles.list}>
          {notes.map((note) => (
            <li key={note.slug} className={styles.entry}>
              <time className="label" dateTime={note.date}>
                {formatDate(note.date)}
              </time>
              <h3 className={styles.entryTitle}>{note.title}</h3>
              <p className={styles.summary}>{note.summary}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className={`label ${styles.status}`}>Coming soon</p>
      )}
    </Section>
  );
}
