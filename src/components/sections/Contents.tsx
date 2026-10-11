import { TurnLink } from "@/components/layout/ReadingOrder";
import { featuredProjects, projectPath } from "@/content/projects";
import { chapters } from "@/content/site";
import styles from "./Contents.module.css";

/**
 * The home page's other half: a contents page instead of the whole archive
 * at once. Each chapter is a page of its own, with a line saying what is in
 * it; the work lists its projects beneath it, the way a contents page lists
 * the sections of a chapter, so any of them is one step away.
 *
 * The leader dots run from the title to the numeral, as in a printed book.
 */
export function Contents() {
  return (
    <section className={styles.contents} aria-labelledby="contents-title">
      <h2 id="contents-title" className={`label ${styles.heading}`}>
        What&apos;s in here
      </h2>

      <ol className={styles.list}>
        {chapters.map((chapter) => (
          <li key={chapter.key} className={styles.chapter}>
            <TurnLink href={chapter.href} className={styles.entry}>
              <span className={styles.title}>{chapter.label}</span>
              <span className={styles.leader} aria-hidden="true" />
              <span className={`numeral ${styles.numeral}`}>{chapter.numeral}</span>
              <span className={styles.gloss}>{chapter.gloss}</span>
            </TurnLink>

            {chapter.key === "work" ? (
              <ol className={styles.sub}>
                {featuredProjects.map((project, i) => (
                  <li key={project.slug}>
                    <TurnLink href={projectPath(project.slug)} className={styles.subEntry}>
                      <span className={styles.subTitle}>{project.name}</span>
                      <span className={styles.leader} aria-hidden="true" />
                      <span className={`numeral ${styles.numeral}`}>
                        {chapter.numeral}.{i + 1}
                      </span>
                    </TurnLink>
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
