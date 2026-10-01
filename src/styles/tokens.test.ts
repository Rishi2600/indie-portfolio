import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The palette's promises, checked against tokens.css itself rather than
 * against a copy of its numbers: every pairing a reader has to read clears
 * its WCAG floor by day and by night, and nothing coloured by day is left
 * without a night value.
 */

const css = readFileSync(join(__dirname, "tokens.css"), "utf8");

function block(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`no block for ${selector}`);
  const body = css.slice(start, css.indexOf("\n}", start));
  const tokens = new Map<string, string>();
  for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    tokens.set(name!, value!.trim());
  }
  return tokens;
}

const day = block(":root");
const night = block(':root[data-theme="night"]');

/** A token's value in a theme, following var() through to a colour. */
function value(theme: Map<string, string>, name: string): string {
  const raw = theme.get(name) ?? day.get(name);
  if (raw === undefined) throw new Error(`no token ${name}`);
  const ref = /^var\((--[\w-]+)\)$/.exec(raw);
  return ref ? value(theme, ref[1]!) : raw;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Foreground, background, the floor it must clear, and what it is used for. */
const FLOORS: [string, string, number, string][] = [
  ["--ink", "--paper", 7, "headings and prose"],
  ["--ink-soft", "--paper", 7, "notes and descriptions"],
  ["--ink-faint", "--paper", 4.5, "small labels, 11px"],
  ["--rubric", "--paper", 4.5, "section numerals and picked names, 11px"],
  ["--rubric-soft", "--paper", 3, "the hover underline (non-text)"],
  ["--focus", "--paper", 3, "the focus ring (non-text)"],
  ["--ink", "--selection", 4.5, "selected text"],
];

describe.each([
  ["day", day],
  ["night", night],
] as const)("%s", (_, theme) => {
  it.each(FLOORS)("%s on %s clears %s:1 (%s)", (fg, bg, floor) => {
    const ratio = contrast(value(theme, fg), value(theme, bg));
    expect(ratio).toBeGreaterThanOrEqual(floor);
  });

  it("keeps ornament ink below anything a reader has to read", () => {
    // Ghost ink is for ornament only; if it ever clears 4.5:1 it will be
    // mistaken for, and used as, a text colour.
    expect(contrast(value(theme, "--ink-ghost"), value(theme, "--paper"))).toBeLessThan(4.5);
  });
});

describe("night", () => {
  it("is declared dark, so scrollbars and form controls follow it", () => {
    expect(night.get("color-scheme")).toBeUndefined(); // a property, not a token
    expect(css).toMatch(/:root\[data-theme="night"\] \{\s*color-scheme: dark;/);
  });

  it("gives every colour the site uses by day a night value", () => {
    const sources = readdirSync(join(__dirname, ".."), { recursive: true, encoding: "utf8" })
      .filter((f) => f.endsWith(".css") && !f.endsWith("tokens.css"))
      .map((f) => readFileSync(join(__dirname, "..", f), "utf8"))
      .join("\n");
    const used = new Set([...sources.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]!));
    // A token is a colour if it resolves to one, following var() through.
    const coloured = [...day.keys()].filter((name) => /^(#|rgba?\(|url\()/.test(value(day, name)));
    const missing = coloured.filter((name) => used.has(name) && !night.has(name));
    expect(missing).toEqual([]);
  });
});
