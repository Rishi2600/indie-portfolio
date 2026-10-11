import { TurnLink } from "@/components/layout/ReadingOrder";
import { projectPath, type Project } from "@/content/projects";
import styles from "./ProjectLinks.module.css";

/**
 * Where a project can be read or run.
 *
 * The visible label names where the link goes, set in small capitals; the
 * accessible name adds which project, in ordinary case, so each link is
 * unambiguous on its own and no screen reader is tempted to spell "GITHUB"
 * out. It begins with the visible words, so a voice user can say what they
 * see.
 *
 * A repository always; a live site only where one exists. The project's own
 * page is offered from the index, where it is somewhere else to go, and not
 * from the page itself. The labels are short and casual; the accessible
 * names say plainly where each one goes.
 */
export function ProjectLinks({
  project,
  entryLink = false,
}: {
  project: Project;
  entryLink?: boolean;
}) {
  return (
    <p className={styles.links}>
      {entryLink ? (
        <TurnLink
          className={`link ${styles.projectLink}`}
          href={projectPath(project.slug)}
          aria-label={`The fun parts of ${project.name}`}
        >
          <span className={styles.linkLabel}>The fun parts</span>
          <span
            className={`${styles.arrow} ${styles.forward}`}
            aria-hidden="true"
          >
            →
          </span>
        </TurnLink>
      ) : null}
      <a
        className={`link ${styles.projectLink}`}
        href={project.github}
        aria-label={`Code for ${project.name} on GitHub`}
      >
        <span className={styles.linkLabel}>Code</span>
        <span className={styles.arrow} aria-hidden="true">
          ↗
        </span>
      </a>
      {project.live ? (
        <a
          className={`link ${styles.projectLink}`}
          href={project.live}
          aria-label={`Try ${project.name} live`}
        >
          <span className={styles.linkLabel}>Try it</span>
          <span className={styles.arrow} aria-hidden="true">
            ↗
          </span>
        </a>
      ) : null}
    </p>
  );
}
