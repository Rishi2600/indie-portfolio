"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cave } from "@/content/cave";
import styles from "./WallInvite.module.css";

/**
 * The way to the wall, at the foot of every page but the wall's own: a line
 * saying there is bare stone at the back, and the way to it. It turns the
 * page forward, as the back of a book is.
 */
export function WallInvite() {
  const pathname = usePathname();
  if (pathname === cave.wall.href) return null;

  return (
    <aside className={styles.invite} aria-labelledby="wall-invite-title">
      <p className="label">{cave.wall.label}</p>
      <h2 id="wall-invite-title" className={styles.title}>
        {cave.wall.title}
      </h2>
      <p className={styles.body}>{cave.wall.invite}</p>
      <Link className={`link ${styles.go}`} href={cave.wall.href} transitionTypes={["nav-forward"]}>
        {cave.wall.go}
        <span aria-hidden="true"> →</span>
      </Link>
    </aside>
  );
}
