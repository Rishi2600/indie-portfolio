"use client";

import { useSyncExternalStore } from "react";
import { cave } from "@/content/cave";
import { firePhase, RELIGHT_EVENT, RELIT_KEY } from "@/lib/fuel";
import styles from "./Embers.module.css";

function relitBefore(): boolean {
  try {
    return localStorage.getItem(RELIT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * The embers in the corner of the cave, where the torch is caught again
 * when it burns out (lib/fuel.ts).
 *
 * They are only there once the torch has started to go: while it burns, the
 * cave is exactly as it always was. Carrying the torch over them and holding
 * it there catches it (Torch.tsx); pressing them does too, which is how a
 * touch screen or a keyboard relights it.
 *
 * Above the darkness, like the toggle: they give off their own light. The
 * first time the torch goes out a line beside them says what they are for;
 * once a reader has caught the torch themselves, it never shows again.
 */
export function Embers() {
  const phase = useSyncExternalStore(firePhase.subscribe, firePhase.get, () => "burning" as const);
  const showing = phase === "dying" || phase === "out";
  // Read during render on purpose: it only changes when the torch is relit,
  // and that also changes the phase, which renders this again.
  const hint = phase === "out" && typeof window !== "undefined" && !relitBefore();

  return (
    <div className={styles.embers} data-phase={phase} hidden={!showing}>
      <button
        type="button"
        className={styles.bed}
        data-embers=""
        aria-label={cave.embers.label}
        onClick={() => window.dispatchEvent(new Event(RELIGHT_EVENT))}
      >
        <svg viewBox="0 0 64 32" width="64" height="32" aria-hidden="true">
          <defs>
            <radialGradient id="ember-heat">
              <stop offset="0" stopColor="#ffb25c" />
              <stop offset="0.5" stopColor="#e2582a" />
              <stop offset="1" stopColor="#7a1f0c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse className={styles.heat} cx="32" cy="22" rx="30" ry="10" fill="url(#ember-heat)" />
          <path className={styles.coal} d="M8 26l5-7 8-1 4 5-3 4z" />
          <path className={styles.coal} style={{ animationDelay: "-1.3s" }} d="M22 27l3-9 9-3 6 6-2 7z" />
          <path className={styles.coal} style={{ animationDelay: "-2.6s" }} d="M38 27l2-7 8-2 7 5-3 5z" />
          <path className={styles.char} d="M14 21l12-2M30 18l10 2M42 21l9 1" />
        </svg>
        <span className={styles.spark} aria-hidden="true" />
        <span className={styles.spark} aria-hidden="true" />
      </button>
      {hint ? <p className={`label ${styles.hint}`}>{cave.embers.hint}</p> : null}
    </div>
  );
}
