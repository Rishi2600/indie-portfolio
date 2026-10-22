"use client";

import { useEffect, useState } from "react";
import { cave } from "@/content/cave";
import { fireSound, SOUND_KEY } from "@/lib/sound/fire";
import styles from "./SoundToggle.module.css";

function remembered(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}

/**
 * The fire's sound, on or off (lib/sound/fire.ts). Beside Day / Night, and
 * only at night: there is no fire by day. Off until a reader turns it on;
 * the choice is remembered.
 *
 * A browser only lets a page start making sound in answer to the reader, so
 * a reader who left it on last time hears it from their first click or key
 * press, not the moment the page opens. It goes quiet while the tab is
 * hidden.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!remembered()) return;
    // Read once on arrival: the server cannot know it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(true);
    const first = () => fireSound(true);
    window.addEventListener("pointerdown", first, { once: true });
    window.addEventListener("keydown", first, { once: true });
    return () => {
      window.removeEventListener("pointerdown", first);
      window.removeEventListener("keydown", first);
    };
  }, []);

  useEffect(() => {
    if (!on) return;
    const onVisibility = () => fireSound(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [on]);

  function toggle() {
    const next = !on;
    setOn(next);
    fireSound(next);
    try {
      if (next) localStorage.setItem(SOUND_KEY, "on");
      else localStorage.removeItem(SOUND_KEY);
    } catch {
      // Not remembered; it holds for this visit.
    }
  }

  return (
    <span className={`label ${styles.switch}`}>
      <button type="button" className={styles.sound} aria-pressed={on} aria-label={cave.sound.name} onClick={toggle}>
        <span className={styles.mark} aria-hidden="true" />
        {cave.sound.label}
      </button>
    </span>
  );
}
