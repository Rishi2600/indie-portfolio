import { MarginMark } from "@/components/decorative/MarginMark";
import { Section } from "@/components/layout/Section";
import { marks } from "@/content/marks";
import { notes, notesEmpty, notesIntro } from "@/content/notes";
import { sectionIndex } from "@/content/site";
import { formatDate } from "@/lib/time/format";
import styles from "./Notes.module.css";

export function Notes() {
  return (
    <Section
      id="notes"
      index={sectionIndex.notes}
      label="Notes"
      title="Notes"
    >
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
        <div className={styles.empty}>
          <p className="label">{notesEmpty.status}</p>
          <p className="note">{notesEmpty.note}</p>
        </div>
      )}

      <MarginMark {...marks.notes} top="30%" />
    </Section>
  );
}
