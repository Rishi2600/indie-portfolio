import { isIndexable, resolveSiteUrl, type Env } from "@/lib/site-url";

const env: Env = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
};

const siteEnv = { url: resolveSiteUrl(env), indexable: isIndexable(env) };

/**
 * Site-level facts and structure.
 *
 * Everything here is either configuration or copy that appears in more than
 * one place. Section copy lives beside the section that renders it.
 */

export const site = {
  name: "Rishi",
  /** Used in the document title, where it has to say plainly what he does. */
  role: "Backend, full-stack and Solana developer",
  /** The same thing said the way he would say it, under the masthead. */
  tagline: "Builds backends. Breaks things for fun.",
  description:
    "Rishi builds backends at PinnTag and breaks things for fun. Full-stack, open source, Web3 and Solana, and lately hardware and AI agents.",
  /**
   * The canonical origin; see src/lib/site-url.ts for the rules. The
   * variables are read by name, not by passing process.env along, so Next can
   * see exactly which ones this depends on.
   */
  url: siteEnv.url,
  /** Whether search engines should index this deployment at all. */
  indexable: siteEnv.indexable,
  ogLocale: "en_IN",
  /** Where this site's own source lives. Linked from the colophon. */
  repository: "https://github.com/Rishi2600/indie-portfolio",
  /**
   * The name as it is written in Devanagari. It appears twice, small, as a
   * signature rather than as decoration.
   */
  nameDevanagari: "ऋषि",
} as const;

/**
 * The chapters, in reading order. Each is a page of its own, and this list is
 * the one place their order is kept: the masthead, the contents on the home
 * page, the numerals in the margin and the arrow keys that turn from one page
 * to the next all read it.
 *
 * The technology cross-reference cites a place by these numerals too: "02.1"
 * is the first entry of the work.
 */
export type Chapter = {
  key: "now" | "work" | "stack" | "about" | "notes";
  numeral: string;
  /** The short name, for the masthead and the margin. */
  label: string;
  href: string;
  /** One line on the contents page saying what is behind the link. */
  gloss: string;
};

export const chapters: readonly Chapter[] = [
  {
    key: "now",
    numeral: "01",
    label: "Now",
    href: "/now",
    gloss: "What I'm doing, and what I'm learning while I do it.",
  },
  {
    key: "work",
    numeral: "02",
    label: "Work",
    href: "/projects",
    gloss: "Five things I built. The repos do most of the talking.",
  },
  {
    key: "stack",
    numeral: "03",
    label: "Stack",
    href: "/stack",
    gloss: "The toolbox, plus the stuff I want in it.",
  },
  {
    key: "about",
    numeral: "04",
    label: "About",
    href: "/about",
    gloss: "Mostly about breaking things.",
  },
  {
    key: "notes",
    numeral: "05",
    label: "Notes",
    href: "/notes",
    gloss: "An empty shelf. For now.",
  },
];

export type ChapterKey = Chapter["key"];

export function chapter(key: ChapterKey): Chapter {
  return chapters.find((c) => c.key === key)!;
}

/** The margin numeral of each chapter, by key. */
export const sectionIndex = Object.fromEntries(
  chapters.map((c) => [c.key, c.numeral]),
) as Record<ChapterKey, string>;

/** Where the "say hi" block sits at the foot of every page. */
export const sayHiId = "say-hi";
