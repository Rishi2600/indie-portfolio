"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SectionLink.module.css";

/** How long "Copied" stays up. */
const SHOWN_MS = 1800;

/**
 * The paragraph mark beside a section's heading: a link to that section.
 *
 * It is an ordinary in-page link first, so it works with no script at all and
 * puts the address in the location bar. On top of that it copies the full
 * address, so a reader can share the section without reaching for the bar.
 * If copying is not possible the link still did its job, and nothing is said.
 *
 * It sits beside the heading rather than inside it: the heading names the
 * section for assistive technology, and its name should not include a
 * link.
 */
export function SectionLink({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function copy() {
    const address = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard?.writeText(address).then(
      () => {
        clearTimeout(timer.current);
        setCopied(true);
        timer.current = setTimeout(() => setCopied(false), SHOWN_MS);
      },
      () => {
        // Refused, or not a secure context. The address is in the bar.
      },
    );
  }

  return (
    <>
      <a
        className={styles.mark}
        href={`#${id}`}
        aria-label={`Link to the ${title} section`}
        onClick={copy}
      >
        <span aria-hidden="true">¶</span>
      </a>
      <span
        className={`label ${styles.copied}`}
        data-shown={copied}
        aria-hidden="true"
      >
        Copied
      </span>
      <span className="visually-hidden" role="status">
        {copied ? "Link copied" : ""}
      </span>
    </>
  );
}
