import Link from "next/link";
import type { ReactNode } from "react";
import { Section } from "@/components/layout/Section";
import { InlineList } from "@/components/ui/InlineList";
import { projectPath, type Project } from "@/content/projects";
import { sectionIndex } from "@/content/site";
import styles from "./ProjectDetail.module.css";
import { ProjectLinks } from "./ProjectLinks";

const pad = (n: number) => String(n).padStart(2, "0");

function Note({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className={styles.note}>
      <dt className="label">{term}</dt>
      <dd className={styles.noteBody}>{children}</dd>
    </div>
  );
}

/** A neighbouring entry, for the row that leads on from this one. */
function Neighbour({
  project,
  position,
  direction,
}: {
  project: Project;
  position: number;
  direction: "prev" | "next";
}) {
  return (
    <Link
      className={`link ${styles.moreLink}`}
      href={projectPath(project.slug)}
      rel={direction}
    >
      <span className="label">{direction === "prev" ? "Previous" : "Next"}</span>
      <span className={styles.moreName}>
        <span className="numeral">{pad(position)}</span> {project.name}
      </span>
    </Link>
  );
}

/**
 * One project, opened out: the entry the index shows in part, with the
 * fields the index leaves for here — what was built, how it is used, why it
 * has a place on this site.
 *
 * It is the same entry, so it is set in the same ledger: the margin carries
 * the entry's number as the index does (02.1 is the first entry of section
 * 02), and the page ends by leading on to the entries either side of it.
 *
 * Everything comes from the project record; this adds no claim of its own.
 */
export function ProjectDetail({
  project,
  position,
  previous,
  next,
}: {
  project: Project;
  /** This entry's place in the index, from 1. */
  position: number;
  previous: Project | undefined;
  next: Project | undefined;
}) {
  const title = project.nameNote
    ? `${project.name} (${project.nameNote})`
    : project.name;

  return (
    <Section
      id="entry"
      index={`${sectionIndex.work}.${position}`}
      label="Work"
      title={title}
      level={1}
    >
      {project.status ? (
        <p className={`label ${styles.status}`}>{project.status}</p>
      ) : null}

      <p className={styles.lede}>{project.shortDescription}</p>
      <p className={styles.description}>{project.description}</p>

      <dl className={styles.notes}>
        <Note term="Why">{project.whyBuilt}</Note>

        <Note term="Built">
          <ul className={styles.built}>
            {project.contribution.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Note>

        <Note term="Engineering">
          <ul className={styles.highlights}>
            {project.engineeringHighlights.map((highlight) => (
              <li key={highlight.title}>
                <h2 className={styles.highlightTitle}>{highlight.title}</h2>
                <p className={styles.highlightBody}>{highlight.body}</p>
              </li>
            ))}
          </ul>
        </Note>

        <Note term="In use">{project.usage}</Note>
        <Note term="Why here">{project.portfolioReason}</Note>

        <Note term="Built with">
          <InlineList items={project.technologies} className={styles.stack} />
        </Note>
      </dl>

      <ProjectLinks project={project} />

      <nav className={styles.more} aria-label="More work">
        <ul className={styles.moreList}>
          {previous ? (
            <li className={styles.previous}>
              <Neighbour
                project={previous}
                position={position - 1}
                direction="prev"
              />
            </li>
          ) : null}
          <li className={styles.index}>
            <Link className={`link ${styles.moreLink}`} href="/#work">
              <span className="label">The index</span>
              <span className={styles.moreName}>All selected work</span>
            </Link>
          </li>
          {next ? (
            <li className={styles.following}>
              <Neighbour
                project={next}
                position={position + 1}
                direction="next"
              />
            </li>
          ) : null}
        </ul>
      </nav>
    </Section>
  );
}
