import Link from "next/link";
import { MandalaMark } from "@/components/decorative/MandalaMark";
import { PaperRule } from "@/components/decorative/PaperRule";
import { Clock } from "@/components/ui/Clock";
import { nav, site } from "@/content/site";
import styles from "./Masthead.module.css";

/**
 * The mark carries the identity here and the name is saved for the opening,
 * so the reader is not told twice in the first hundred pixels.
 *
 * Nothing about this is sticky. A bar that follows you down the page is a
 * product's habit, and this is not a product.
 */
export function Masthead() {
  return (
    <header id="top" className={styles.masthead}>
      <div className={styles.top}>
        <Link
          href="/"
          className={styles.mark}
          aria-label={`${site.name} — home`}
        >
          <MandalaMark size={26} />
        </Link>

        <nav aria-label="Sections">
          <ul className={styles.nav}>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={`label ${styles.navLink}`}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <PaperRule variant="double" />

      <div className={styles.dateline}>
        <p className="label">{site.role}</p>
        <Clock />
      </div>
    </header>
  );
}
