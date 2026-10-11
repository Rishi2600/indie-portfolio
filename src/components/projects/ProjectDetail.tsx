import type { ReactNode } from "react";
import { Section } from "@/components/layout/Section";
import { TurnLink } from "@/components/layout/ReadingOrder";
import { TechList } from "@/components/ui/TechIndex";
import type { Project } from "@/content/projects";
import { chapter } from "@/content/site";
import styles from "./ProjectDetail.module.css";
import { ProjectLinks } from "./ProjectLinks";

function Note({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className={styles.note}>
      <dt className="label">{term}</dt>
      <dd className={styles.noteBody}>{children}</dd>
    </div>
  );
}

/**
 * One project, opened out: the line it is introduced by in the index, what
 * it does, why it exists, the parts that were
 * fun to build, and what it was built with. Not every last detail; the
 * repository is one click away and has the rest.
 *
 * The margin carries the entry's number (02.1 is the first project of
 * chapter 02), and the foot of the page turns on to the next one like any
 * other page (PageTurn).
 *
 * Everything comes from the project record; this adds no claim of its own.
 */
export function ProjectDetail({
  project,
  position,
}: {
  project: Project;
  /** This entry's place in the index, from 1. */
  position: number;
}) {
  const work = chapter("work");
  const title = project.nameNote
    ? `${project.name} (${project.nameNote})`
    : project.name;

  return (
    <Section
      id="entry"
      index={`${work.numeral}.${position}`}
      label={work.label}
      title={title}
      level={1}
    >
      <p className={styles.back}>
        <TurnLink className={`label ${styles.backLink}`} href={work.href}>
          <span aria-hidden="true">← </span>All the work
        </TurnLink>
        {project.status ? (
          <span className={`label ${styles.status}`}>{project.status}</span>
        ) : null}
      </p>

      <p className={styles.lede}>{project.teaser.text}</p>
      <p className={styles.description}>{project.description}</p>

      <dl className={styles.notes}>
        <Note term="Why">{project.whyBuilt}</Note>

        <Note term="The fun parts">
          <ul className={styles.highlights}>
            {project.engineeringHighlights.map((highlight) => (
              <li key={highlight.title}>
                <h2 className={styles.highlightTitle}>{highlight.title}</h2>
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

      <p className={styles.more}>The repo has everything else.</p>
      <ProjectLinks project={project} />
    </Section>
  );
}
