"use client";

import { useState } from "react";
import styles from "./Obsession.module.css";

/**
 * The end of a sentence that will not sit still: one of the things Rishi
 * cannot stop thinking about, and a button that moves on to the next.
 *
 * Without script the first one simply stands. The sentence is read whole by
 * assistive technology; the button says what it does, and the new ending is
 * announced when it changes.
 */
export function Obsession({ before, items }: { before: string; items: readonly string[] }) {
  const [at, setAt] = useState(0);
  const [turns, setTurns] = useState(0);
  const current = items[at % items.length];

  return (
    <p className={styles.line}>
      {before}{" "}
      <span aria-live="polite">
        <span className={styles.word} key={turns}>
          {current}
        </span>
      </span>
      .{" "}
      <button
        type="button"
        className={styles.next}
        onClick={() => {
          setAt((i) => (i + 1) % items.length);
          setTurns((n) => n + 1);
        }}
        aria-label="And what else?"
        title="And what else?"
      >
        <span aria-hidden="true">↻</span>
      </button>
      {turns >= items.length ? (
        <span className={styles.aside}> (yes, it loops. that&apos;s the problem.)</span>
      ) : null}
    </p>
  );
}
