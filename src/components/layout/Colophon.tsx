import { PaperRule } from "@/components/decorative/PaperRule";
import { SectionDivider } from "@/components/decorative/SectionDivider";
import { Clock } from "@/components/ui/Clock";
import { VisitCount } from "@/components/ui/VisitCount";
import { elsewhere } from "@/content/links";
import { site } from "@/content/site";
import styles from "./Colophon.module.css";

/**
 * Evaluated once, when the page is generated. The site is statically built,
 * so this is the year of the last deploy rather than the year it is read in —
 * which is what a copyright line means anyway.
 */
const year = new Date().getFullYear();

const published = elsewhere.filter((entry) => entry.href);

export function Colophon() {
  return (
    <footer className={styles.colophon}>
      <PaperRule variant="double" />
      <SectionDivider variant="terminal" className={styles.terminal} />

      <div className={styles.grid}>
        <div>
          <p className={styles.name}>
            {site.name}
            <span className={styles.devanagari} lang="hi" aria-hidden="true">
              {site.nameDevanagari}
            </span>
          </p>
          <p className="label">{site.role}</p>
        </div>

        <div className={styles.meta}>
          <Clock layout="stack" />
          <VisitCount />
        </div>
      </div>

      <PaperRule className={styles.rule} />

      <div className={styles.foot}>
        <p className={styles.note}>
          Set in EB Garamond and IBM Plex, on a page ruled the way a scribe
          rules one. Built with Next.js; the source is{" "}
          <a className="link" href={site.repository}>
            on GitHub
          </a>
          .
        </p>

        <div className={styles.closing}>
          <ul className={styles.links}>
            {published.map((entry) => (
              <li key={entry.label}>
                <a
                  className={`label ${styles.link}`}
                  href={entry.href}
                  rel="me"
                >
                  {entry.label}
                </a>
              </li>
            ))}
            <li>
              <a className={`label ${styles.link}`} href="#top">
                Back to top
              </a>
            </li>
          </ul>

          <p className="label">
            © {year} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
