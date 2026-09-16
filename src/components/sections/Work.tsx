import { Section } from "@/components/layout/Section";
import { projects, projectsNote } from "@/content/projects";
import styles from "./Work.module.css";

/**
 * Ruled but unwritten rows drawn while the index has nothing in it: one for
 * each of the five projects the work index is being prepared to hold.
 */
const RESERVED_ROWS = 5;

const pad = (n: number) => String(n).padStart(2, "0");

export function Work() {
  return (
    <Section id="work" index="02" label="Work" title="Selected work">
      <p className="note">{projectsNote}</p>

      {projects.length > 0 ? (
        <ol className={styles.index}>
          {projects.map((project, i) => (
            <li key={project.title} className={styles.entry}>
              <span className="numeral">{pad(i + 1)}</span>

              <div>
                <h3 className={styles.entryTitle}>{project.title}</h3>
                <p className={styles.description}>{project.description}</p>
                {project.technologies.length > 0 ? (
                  <p className={styles.stack}>
                    {project.technologies.join(" · ")}
                  </p>
                ) : null}
              </div>

              <div className={styles.meta}>
                {project.year ? (
                  <span className="label">{project.year}</span>
                ) : null}
                {project.githubUrl ? (
                  <a
                    className={`link ${styles.metaLink}`}
                    href={project.githubUrl}
                  >
                    Source
                  </a>
                ) : null}
                {project.liveUrl ? (
                  <a
                    className={`link ${styles.metaLink}`}
                    href={project.liveUrl}
                  >
                    Live
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ol className={styles.index} aria-hidden="true">
          {Array.from({ length: RESERVED_ROWS }, (_, i) => (
            <li key={i} className={`${styles.entry} ${styles.reserved}`}>
              <span className={styles.reservedNumeral}>{pad(i + 1)}</span>
              <span className={styles.reservedLine} />
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
