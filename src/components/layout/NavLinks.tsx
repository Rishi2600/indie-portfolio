"use client";

import { usePathname } from "next/navigation";
import type { Chapter } from "@/content/site";
import { sayHiId } from "@/content/site";
import { TurnLink } from "./ReadingOrder";
import styles from "./Masthead.module.css";

/**
 * The chapters, with the one being read marked. A project's page is part of
 * the work, so the work is marked there too.
 */
export function NavLinks({ chapters }: { chapters: readonly Pick<Chapter, "label" | "href">[] }) {
  const pathname = usePathname();

  return (
    <ul className={styles.nav}>
      {chapters.map((item) => {
        const here = pathname === item.href;
        const within = !here && pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <TurnLink
              href={item.href}
              className={`label ${styles.navLink}`}
              aria-current={here ? "page" : within ? "true" : undefined}
            >
              {item.label}
            </TurnLink>
          </li>
        );
      })}
      <li>
        <a href={`#${sayHiId}`} className={`label ${styles.navLink} ${styles.hi}`}>
          Say hi
        </a>
      </li>
    </ul>
  );
}
