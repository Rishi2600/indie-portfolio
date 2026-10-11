import { CavePainting } from "@/components/decorative/CavePainting";
import { MarginMark } from "@/components/decorative/MarginMark";
import { Yantra } from "@/components/decorative/Yantra";
import { Section } from "@/components/layout/Section";
import { TurnLink } from "@/components/layout/ReadingOrder";
import { ProjectLinks } from "@/components/projects/ProjectLinks";
import { RandomProject } from "@/components/ui/RandomProject";
import {
  drawerNote,
  featuredProjects,
  projectAnchor,
  projectPath,
  projectsIntro,
  type Project,
} from "@/content/projects";
import { chapter } from "@/content/site";
import styles from "./Work.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

const SHAPE = {
  line: styles.asLine,
  quote: styles.asQuote,
  aside: styles.asAside,
} as const;

/** The project's name, as the way into its page. */
function Name({ project }: { project: Project }) {
  return (
    <h2 className={styles.name}>
      <TurnLink href={projectPath(project.slug)} className={styles.nameLink}>
        {project.name}
      </TurnLink>
      {project.nameNote ? (
        <span className={styles.nameNote}> ({project.nameNote})</span>
      ) : null}
    </h2>
  );
}

function Status({ project }: { project: Project }) {
  return project.status ? (
    <p className={`label ${styles.status}`}>{project.status}</p>
  ) : null;
}

/**
 * One entry in the index: a teaser and the ways in, and nothing else. What
 * it does, why it exists and the interesting parts are on its page; the rest
 * is in the repository.
 *
 * Each project introduces itself the way its record says to (Teaser in
 * content/projects.ts), so the entries do not all look alike: one leads with
 * its name, one with a line from the project, one with a note in the margin.
 * They share the numeral, the rule and the links, which is enough to read as
 * one list.
 */
function Entry({ project, position }: { project: Project; position: number }) {
  const { teaser } = project;

  return (
    <li
      id={projectAnchor(project.slug)}
      className={`${styles.entry} ${SHAPE[teaser.kind]}`}
    >
      <span className={`numeral ${styles.numeral}`} aria-hidden="true">
        {pad(position)}
      </span>

      <div className={styles.body}>
        {teaser.kind === "quote" ? (
          <>
            <p className={styles.quote}>
              <span aria-hidden="true">“</span>
              {teaser.text}
              <span aria-hidden="true">”</span>
            </p>
            <div className={styles.head}>
              <span className={styles.dash} aria-hidden="true">
                —
              </span>
              <Name project={project} />
              <Status project={project} />
            </div>
          </>
        ) : (
          <>
            <div className={styles.head}>
              <Name project={project} />
              <Status project={project} />
            </div>
            <p className={styles.lede}>{teaser.text}</p>
          </>
        )}

        <ProjectLinks project={project} entryLink />
      </div>

      {teaser.kind === "aside" ? (
        <p className={styles.aside}>{teaser.aside}</p>
      ) : null}
    </li>
  );
}

export function Work() {
  const { numeral, label } = chapter("work");

  return (
    <Section
      id="work"
      index={numeral}
      label={label}
      title="Stuff I built"
      level={1}
      backdrop={
        <div className={styles.padma}>
          <Yantra rings={3} draw="scroll" stroke={0.55} />
        </div>
      }
    >
      <p className="note">{projectsIntro}</p>
      <RandomProject
        projects={featuredProjects.map((p) => ({
          name: p.name,
          href: projectPath(p.slug),
        }))}
      />

      <ol className={styles.index}>
        {featuredProjects.map((project, i) => (
          <Entry key={project.slug} project={project} position={i + 1} />
        ))}
      </ol>

      <MarginMark {...drawerNote} top="62%" />
      <CavePainting kind="bison" top="46%" />
    </Section>
  );
}
