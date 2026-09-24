import type { ReactNode } from "react";
import { Yantra } from "@/components/decorative/Yantra";
import { Section } from "@/components/layout/Section";
import { InlineList } from "@/components/ui/InlineList";
import {
  featuredProjects,
  projectsNote,
  type Project,
} from "@/content/projects";
import styles from "./Work.module.css";

/** Ruled but unwritten rows, drawn only if the index is ever emptied. */
const RESERVED_ROWS = 5;

const pad = (n: number) => String(n).padStart(2, "0");

function Note({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className={styles.note}>
      <dt className="label">{term}</dt>
      <dd className={styles.noteBody}>{children}</dd>
    </div>
  );
}

/**
 * One entry in the index.
 *
 * It reads in the order the work should be read in: what it is, why it
 * exists, the part that was interesting to build, what it was built with,
 * and only then where to find it. The stack is last on purpose — it is the
 * least interesting thing about any of these.
 *
 * Everything here comes from the project record, so the same data can fill a
 * dedicated page later without this component being involved.
 */
function Entry({ project, position }: { project: Project; position: number }) {
  return (
    <li className={styles.entry}>
      <span className={`numeral ${styles.numeral}`} aria-hidden="true">
        {pad(position)}
      </span>

      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>
            {project.name}
            {project.nameNote ? (
              <span className={styles.nameNote}> ({project.nameNote})</span>
            ) : null}
          </h3>
          {project.status ? (
            <p className={`label ${styles.status}`}>{project.status}</p>
          ) : null}
        </div>

        <p className={styles.lede}>{project.shortDescription}</p>
        <p className={styles.description}>{project.description}</p>

        <dl className={styles.notes}>
          <Note term="Why">{project.whyBuilt}</Note>

          <Note term="Engineering">
            <ul className={styles.highlights}>
              {project.engineeringHighlights.map((highlight) => (
                <li key={highlight.title}>
                  <h4 className={styles.highlightTitle}>{highlight.title}</h4>
                  <p className={styles.highlightBody}>{highlight.body}</p>
                </li>
              ))}
            </ul>
          </Note>

          <Note term="Built with">
            <InlineList items={project.technologies} className={styles.stack} />
          </Note>

          <Note term="Used">{project.usage}</Note>
        </dl>

        <p className={styles.links}>
          {/* Source always; a live link only where one exists. */}
          <a className={`link ${styles.projectLink}`} href={project.github}>
            Source
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
            <span className="visually-hidden"> — {project.name} on GitHub</span>
          </a>
          {project.live ? (
            <a className={`link ${styles.projectLink}`} href={project.live}>
              Live
              <span className={styles.arrow} aria-hidden="true">
                ↗
              </span>
              <span className="visually-hidden"> — {project.name}</span>
            </a>
          ) : null}
        </p>
      </div>
    </li>
  );
}

export function Work() {
  return (
    <Section
      id="work"
      index="02"
      label="Work"
      title="Selected work"
      backdrop={
        <div className={styles.padma}>
          <Yantra rings={3} draw="scroll" stroke={0.55} />
        </div>
      }
    >
      <p className="note">{projectsNote}</p>

      {featuredProjects.length > 0 ? (
        <ol className={styles.index}>
          {featuredProjects.map((project, i) => (
            <Entry key={project.slug} project={project} position={i + 1} />
          ))}
        </ol>
      ) : (
        <ol className={`${styles.index} ${styles.reservedIndex}`} aria-hidden="true">
          {Array.from({ length: RESERVED_ROWS }, (_, i) => (
            <li key={i} className={styles.reserved}>
              <span className={styles.reservedNumeral}>{pad(i + 1)}</span>
              <span className={styles.reservedLine} />
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
