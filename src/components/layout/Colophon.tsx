import { Backdrop } from "@/components/decorative/Backdrop";
import { PaperRule } from "@/components/decorative/PaperRule";
import { SectionDivider } from "@/components/decorative/SectionDivider";
import { Yantra } from "@/components/decorative/Yantra";
import { Clock } from "@/components/ui/Clock";
import { VisitCount } from "@/components/ui/VisitCount";
import { elsewhere } from "@/content/links";
import { profile } from "@/content/profile";
import { sayHiId, site } from "@/content/site";
import styles from "./Colophon.module.css";

/**
 * Evaluated once, when the page is generated. The site is statically built,
 * so this is the year of the last deploy rather than the year it is read in —
 * which is what a copyright line means anyway.
 */
const year = new Date().getFullYear();

/**
 * The foot of every page: where to find Rishi, then the colophon a printer
 * sets on the last leaf: the identity once more, the two clocks and the visit
 * count, and a note on how the thing was made.
 *
 * Saying hi is here rather than on a page of its own, so it is never more
 * than a scroll away. Profiles carry rel="me", which is how other sites
 * verify that these accounts and this page belong to the same person; the
 * email does not, because an address is not a page.
 */
export function Colophon() {
  return (
    <footer className={styles.colophon}>
      <Backdrop>
        <div className={styles.seal}>
          <Yantra draw="scroll" stroke={0.45} />
        </div>
      </Backdrop>

      <section id={sayHiId} className={styles.hi} aria-labelledby={`${sayHiId}-title`}>
        <h2 id={`${sayHiId}-title`} className={styles.hiTitle}>
          {profile.contact.title}
        </h2>
        <p className={styles.hiBody}>{profile.contact.body}</p>

        <ul className={styles.addresses}>
          {elsewhere.map((entry) => (
            <li key={entry.label}>
              <a
                className={`link ${styles.address}`}
                href={entry.href}
                rel={entry.kind === "profile" ? "me" : undefined}
              >
                <span className="label">{entry.label}</span>
                <span className={styles.value}>
                  {entry.value}
                  {entry.kind === "profile" ? (
                    <span className={styles.arrow} aria-hidden="true">
                      ↗
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

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
          <p className="label">{site.tagline}</p>
        </div>

        <div className={styles.meta}>
          <Clock layout="stack" />
          <VisitCount />
        </div>
      </div>

      <PaperRule className={styles.rule} />

      <div className={styles.foot}>
        <p className={styles.note}>
          Ruled like an old manuscript and set in EB Garamond and IBM Plex.
          Built with Next.js. The source is{" "}
          <a className="link" href={site.repository}>
            on GitHub
          </a>{" "}
          if you want to see how it works.
        </p>

        <div className={styles.closing}>
          <a className={`label ${styles.link}`} href="#top">
            Back to top
          </a>
          <p className="label">
            © {year} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
