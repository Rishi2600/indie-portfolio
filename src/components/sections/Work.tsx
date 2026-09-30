import type { ReactNode } from "react";
import { Yantra } from "@/components/decorative/Yantra";
import { Section } from "@/components/layout/Section";
import { ProjectLinks } from "@/components/projects/ProjectLinks";
import { TechList } from "@/components/ui/TechIndex";
import {
  featuredProjects,
  projectAnchor,
  projectsNote,
  type Project,
} from "@/content/projects";
import { sectionIndex } from "@/content/site";
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
 * least interesting thing about any of these. How a project is deployed is
 * the short label beside its name; the fuller `usage`, `contribution` and
 * `portfolioReason` are on the project's own page, which the first link
 * leads to, and would only repeat here.
 *
 * Everything here comes from the project record. The entry's id is what the
 * technology cross-reference points at.
 */
function Entry({ project, position }: { project: Project; position: number }) {
  return (
    <li id={projectAnchor(project.slug)} className={styles.entry}>
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
            <TechList
              items={project.technologies}
              place={project.slug}
              className={styles.stack}
            />
          </Note>
        </dl>

        <ProjectLinks project={project} entryLink />
      </div>
    </li>
  );
}

export function Work() {
  return (
    <Section
      id="work"
      index={sectionIndex.work}
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
