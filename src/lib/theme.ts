/**
 * Day or night, and who decided.
 *
 * Until a reader chooses, the page follows their system: a reader whose
 * device is dark gets night. A choice is remembered, but a choice that agrees
 * with the system is not stored at all, so switching back to what the system
 * prefers puts the reader back to following it. That keeps a third "auto"
 * setting off the page without ever trapping anyone in an old choice.
 *
 * The theme is an attribute on <html>, set by `themeScript` while the page is
 * still being parsed, before anything is painted. Everything here that runs
 * later only ever changes that attribute.
 */

export type Theme = "day" | "night";

export const THEME_KEY = "theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Which theme to show, from what is stored (if anything) and the system. */
export function resolveTheme(stored: string | null, systemPrefersDark: boolean): Theme {
  if (stored === "day" || stored === "night") return stored;
  return systemPrefersDark ? "night" : "day";
}

/** What to store when the reader picks a theme: nothing, if the system agrees. */
export function choiceToStore(picked: Theme, systemPrefersDark: boolean): Theme | null {
  return picked === resolveTheme(null, systemPrefersDark) ? null : picked;
}

/**
 * The same decision as `resolveTheme`, as a script for <head>. It has to be
 * self-contained and run in any browser, so it is written out by hand in
 * plain ES5; theme.test.ts runs it against `resolveTheme` case by case so
 * the two cannot drift. Storage that throws (a private window, blocked site
 * data) and a browser without matchMedia both fall through to day.
 */
export const themeScript =
  `(function(){var t=null;try{t=localStorage.getItem("${THEME_KEY}")}catch(e){}` +
  `if(t!=="day"&&t!=="night"){t=window.matchMedia&&window.matchMedia("${DARK_QUERY}").matches?"night":"day"}` +
  `document.documentElement.setAttribute("data-theme",t)})()`;
