"use client";

import { Fragment, useEffect, useSyncExternalStore } from "react";
import {
  choiceToStore,
  DARK_QUERY,
  resolveTheme,
  THEME_KEY,
  type Theme,
} from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

const OPTIONS: readonly { theme: Theme; label: string }[] = [
  { theme: "day", label: "Day" },
  { theme: "night", label: "Night" },
];

function current(): Theme {
  return document.documentElement.getAttribute("data-theme") === "night"
    ? "night"
    : "day";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function stored(): string | null {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

/**
 * Switches the whole page in one frame. Transitions are held off while the
 * attribute changes (see base.css), or every link and label would fade to its
 * new colour at its own speed while the paper had already changed.
 */
function apply(theme: Theme) {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === theme) return;
  root.setAttribute("data-theme-switching", "");
  root.setAttribute("data-theme", theme);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-theme-switching")),
  );
}

/**
 * Day / Night, beside the clocks: two small buttons in the dateline's own
 * capitals.
 *
 * Which one is inked comes from the attribute on <html>, in CSS, so it is
 * right in the first frame; the inline script set that attribute before the
 * page was painted. The pressed state for assistive technology arrives a
 * moment later, once this has hydrated, because the server cannot know it.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, current, () => null);

  useEffect(() => {
    const dark = window.matchMedia(DARK_QUERY);
    // A reader who has not chosen follows their system, even mid-visit.
    const follow = () => apply(resolveTheme(stored(), dark.matches));
    // A choice made in another tab.
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null) follow();
    };
    dark.addEventListener("change", follow);
    window.addEventListener("storage", onStorage);
    return () => {
      dark.removeEventListener("change", follow);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function pick(choice: Theme) {
    const keep = choiceToStore(choice, window.matchMedia(DARK_QUERY).matches);
    try {
      if (keep) localStorage.setItem(THEME_KEY, keep);
      else localStorage.removeItem(THEME_KEY);
    } catch {
      // Storage is blocked: the choice holds for this page only.
    }
    apply(choice);
  }

  return (
    <div className={`label ${styles.toggle}`} role="group" aria-label="Theme">
      {OPTIONS.map((option, i) => (
        <Fragment key={option.theme}>
          {i > 0 ? (
            <span className={styles.sep} aria-hidden="true">
              /
            </span>
          ) : null}
          <button
            type="button"
            className={`${styles.option} ${styles[option.theme]}`}
            aria-pressed={theme === null ? undefined : theme === option.theme}
            onClick={() => pick(option.theme)}
          >
            {option.label}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
