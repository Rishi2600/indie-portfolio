"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import styles from "./RandomProject.module.css";

type Pick = { name: string; href: string };

/**
 * For the reader who would rather not choose: opens one of the projects at
 * random, turning forward to it like any other page further into the book.
 *
 * A button, because it does something rather than going somewhere fixed.
 * Without script it is not drawn at all, since it could do nothing.
 */
const noop = () => () => {};

export function RandomProject({ projects }: { projects: readonly Pick[] }) {
  const router = useRouter();
  // False on the server and in the first render, true once script runs.
  const live = useSyncExternalStore(noop, () => true, () => false);
  if (!live || projects.length === 0) return null;

  return (
    <p className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          const pick = projects[Math.floor(Math.random() * projects.length)]!;
          router.push(pick.href, { transitionTypes: ["nav-forward"] });
        }}
      >
        <span className={styles.die} aria-hidden="true">
          ⚄
        </span>
        Can&apos;t decide? Open one at random
      </button>
    </p>
  );
}
