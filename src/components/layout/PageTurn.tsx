"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { around } from "@/lib/reading-order";
import { TurnLink, useReadingOrder } from "./ReadingOrder";
import styles from "./PageTurn.module.css";

/** Keys the arrows must not be taken from: somewhere the reader is typing. */
function typing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/**
 * The foot of each page: the page before, the page after, and a word that
 * the arrow keys turn them too. The whole site reads front to back this
 * way, projects included (lib/reading-order.ts), and the last page leads
 * back to the first.
 *
 * The arrow keys are only taken when nothing else wants them: not with a
 * modifier held (that is the browser's own back and forward), not while the
 * reader is typing, and not if something on the page has already used the
 * key. Nothing on the site scrolls sideways, so they are otherwise idle.
 */
export function PageTurn() {
  const order = useReadingOrder();
  const pathname = usePathname();
  const router = useRouter();
  const { previous, next } = around(order, pathname);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (typing(event.target)) return;
      const to =
        event.key === "ArrowRight" ? next : event.key === "ArrowLeft" ? previous : undefined;
      if (!to) return;
      event.preventDefault();
      router.push(to.href, {
        transitionTypes: [event.key === "ArrowRight" ? "nav-forward" : "nav-back"],
      });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previous, next, router]);

  if (!previous && !next) return null;
  const first = order[0];

  return (
    <nav className={styles.turn} aria-label="Turn the page">
      <ul className={styles.list}>
        <li className={styles.previous}>
          {previous ? (
            <TurnLink className={`link ${styles.link}`} href={previous.href} rel="prev">
              <span className="label">
                <span aria-hidden="true">← </span>Back
              </span>
              <span className={styles.name}>
                {previous.numeral ? <span className="numeral">{previous.numeral}</span> : null}{" "}
                {previous.title}
              </span>
            </TurnLink>
          ) : null}
        </li>

        <li className={styles.hint} aria-hidden="true">
          <kbd>←</kbd> <kbd>→</kbd> work too
        </li>

        <li className={styles.following}>
          {next ? (
            <TurnLink className={`link ${styles.link}`} href={next.href} rel="next">
              <span className="label">
                Next<span aria-hidden="true"> →</span>
              </span>
              <span className={styles.name}>
                {next.numeral ? <span className="numeral">{next.numeral}</span> : null}{" "}
                {next.title}
              </span>
            </TurnLink>
          ) : first ? (
            <TurnLink className={`link ${styles.link}`} href={first.href}>
              <span className="label">That&apos;s the lot</span>
              <span className={styles.name}>Back to the start</span>
            </TurnLink>
          ) : null}
        </li>
      </ul>
    </nav>
  );
}
