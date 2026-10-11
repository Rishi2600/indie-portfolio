"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BIRD } from "@/lib/bird";
import styles from "./Birds.module.css";

/**
 * Now and then, a small bird crosses the top of the page.
 *
 * It is the one ornament on the site that moves on its own, so it is kept
 * rare: the first crossing comes some seconds after the page opens, the next
 * a minute or more later, and after four there are no more. Nothing flies
 * while the tab is hidden, and nothing flies at all for a reader who has
 * asked for reduced motion — the component checks the preference and keeps
 * checking, and the stylesheet hides the sky as well in case it ever does
 * not.
 *
 * Birds render nothing on the server and nothing until the first crossing
 * is due, so they cannot affect hydration or the first paint.
 */

const FIRST_CROSSING_MS: [number, number] = [9_000, 16_000];
const BETWEEN_CROSSINGS_MS: [number, number] = [55_000, 95_000];
const AFTER_RETURN_MS: [number, number] = [6_000, 12_000];
const MAX_CROSSINGS = 4;

type Crossing = {
  id: number;
  /** Height as a share of the viewport: the upper band, below the masthead's
   *  lines of small type and clear of the fold. */
  top: number;
  seconds: number;
  leftward: boolean;
  pair: boolean;
  scale: number;
};

const between = ([low, high]: [number, number]) =>
  low + Math.random() * (high - low);

export function Birds() {
  const [crossing, setCrossing] = useState<Crossing | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let flown = 0;

    const cancel = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };

    const schedule = (delay: number) => {
      cancel();
      if (reduced.matches || document.hidden || flown >= MAX_CROSSINGS) return;
      timer = setTimeout(launch, delay);
    };

    function launch() {
      timer = undefined;
      if (reduced.matches || document.hidden) return;

      flown += 1;
      const seconds = 19 + Math.random() * 7;
      setCrossing({
        id: flown,
        top: 11 + Math.random() * 17,
        seconds,
        leftward: Math.random() < 0.35,
        pair: Math.random() < 0.5,
        scale: 0.85 + Math.random() * 0.3,
      });
      // The next crossing is measured from the end of this one.
      schedule(seconds * 1000 + between(BETWEEN_CROSSINGS_MS));
    }

    const onVisibility = () => {
      if (document.hidden) cancel();
      else if (timer === undefined) schedule(between(AFTER_RETURN_MS));
    };

    const onPreference = () => {
      if (reduced.matches) {
        cancel();
        setCrossing(null);
      } else {
        schedule(between(AFTER_RETURN_MS));
      }
    };

    schedule(between(FIRST_CROSSING_MS));
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onPreference);

    return () => {
      cancel();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onPreference);
    };
  }, []);

  if (!crossing) return null;

  return (
    <div className={styles.sky} aria-hidden="true">
      <div
        key={crossing.id}
        className={`${styles.flight} ${crossing.leftward ? styles.reverse : ""}`}
        style={
          {
            top: `${crossing.top}vh`,
            "--duration": `${crossing.seconds}s`,
            "--scale": crossing.scale,
          } as CSSProperties
        }
        onAnimationEnd={(event) => {
          // Only the crossing itself ending clears the sky; the wings and
          // the bob loop forever and bubble their own events.
          if (event.target === event.currentTarget) setCrossing(null);
        }}
      >
        <div className={styles.bob}>
          <Bird />
        </div>
        {crossing.pair ? (
          <div className={styles.follower}>
            <div className={styles.bob}>
              <Bird />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A swallow in a few ink strokes: crescent wings hinged at the shoulder, a
 * tapering body and a forked tail. Drawn facing right.
 */
function Bird() {
  return (
    <svg
      className={styles.bird}
      viewBox="0 0 48 24"
      fill="currentColor"
      focusable="false"
      data-bird=""
    >
      <path className={`${styles.wing} ${styles.far}`} d={BIRD.farWing} />
      <path d={BIRD.body} />
      <path
        d={BIRD.tail}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <circle cx={BIRD.head.cx} cy={BIRD.head.cy} r={BIRD.head.r} />
      <path className={styles.wing} d={BIRD.nearWing} />
    </svg>
  );
}
