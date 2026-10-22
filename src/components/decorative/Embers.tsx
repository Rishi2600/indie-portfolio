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
        <svg viewBox="0 0 64 32" width="84" height="42" aria-hidden="true">
          <defs>
            <radialGradient id="ember-heat">
              <stop offset="0" stopColor="#ff9a4a" />
              <stop offset="0.45" stopColor="#c8471f" stopOpacity="0.6" />
              <stop offset="1" stopColor="#7a1f0c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ember-coal" cx="0.45" cy="0.4" r="0.7">
              <stop offset="0" stopColor="#ffc27a" />
              <stop offset="0.35" stopColor="#f0692c" />
              <stop offset="0.75" stopColor="#8e2a10" />
              <stop offset="1" stopColor="#2b130b" />
            </radialGradient>
          </defs>
          <ellipse className={styles.heat} cx="32" cy="23" rx="31" ry="11" fill="url(#ember-heat)" />
          <path className={styles.ash} d="M6 28q6-3 13-2t15 0 14-1 10 3z" />
          <path className={styles.coal} d="M9 26q-1-5 4-7t9 1q2 4-2 6t-11 0z" />
          <path className={styles.coal} style={{ animationDelay: "-1.3s" }} d="M22 26q-2-7 4-10t11 1q3 5 0 8t-15 1z" />
          <path className={styles.coal} style={{ animationDelay: "-2.6s" }} d="M38 27q-1-6 5-8t10 2q2 4-3 6t-12 0z" />
          <path className={styles.char} d="M14 22l4 2M27 19l3 4 4-1M44 22l3 3" />
        </svg>
        <span className={styles.spark} aria-hidden="true" />
        <span className={styles.spark} aria-hidden="true" />
      </button>
      {hint ? <p className={`label ${styles.hint}`}>{cave.embers.hint}</p> : null}
    </div>
  );
}
