import { MandalaMark } from "@/components/decorative/MandalaMark";
import { PaperRule } from "@/components/decorative/PaperRule";
import { Clock } from "@/components/ui/Clock";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { chapters, site } from "@/content/site";
import styles from "./Masthead.module.css";
import { NavLinks } from "./NavLinks";
import { TurnLink } from "./ReadingOrder";

/**
 * The mark carries the identity here and the name is saved for the opening,
 * so the reader is not told twice in the first hundred pixels.
 *
 * Nothing about this is sticky. A bar that follows you down the page is a
 * product's habit, and this is not a product.
 *
 * The navigation is the chapters, each a page of its own, and the way to say
 * hi, which is at the foot of every page.
 */
export function Masthead() {
  return (
    <header id="top" className={styles.masthead}>
      <div className={styles.top}>
        <TurnLink
          href="/"
          className={styles.mark}
          aria-label={`${site.name} — home`}
        >
          <MandalaMark size={26} />
        </TurnLink>

        <nav aria-label="Chapters">
          <NavLinks
            chapters={chapters.map(({ label, href }) => ({ label, href }))}
          />
        </nav>
      </div>

      <PaperRule variant="double" />

      <div className={styles.dateline}>
        <p className="label">{site.tagline}</p>
        <Clock />
        <div className={styles.switches}>
          <SoundToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
