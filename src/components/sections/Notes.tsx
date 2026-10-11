import { CavePainting } from "@/components/decorative/CavePainting";
import { MarginMark } from "@/components/decorative/MarginMark";
import { Section } from "@/components/layout/Section";
import { marks } from "@/content/marks";
import { notes, notesEmpty, notesIntro } from "@/content/notes";
import { chapter } from "@/content/site";
import { formatDate } from "@/lib/time/format";
import styles from "./Notes.module.css";

export function Notes() {
  const { numeral, label } = chapter("notes");

  return (
    <Section
      id="notes"
      index={numeral}
      label={label}
      title="Notes"
      level={1}
    >
      <p className={styles.intro}>{notesIntro}</p>

      {notes.length > 0 ? (
        <ol className={styles.list}>
          {notes.map((note) => (
            <li key={note.slug} className={styles.entry}>
              <time className="label" dateTime={note.date}>
                {formatDate(note.date)}
              </time>
              <h2 className={styles.entryTitle}>{note.title}</h2>
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
      <CavePainting kind="hands" top="52%" />
    </Section>
  );
}
