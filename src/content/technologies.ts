/**
 * The technology cross-reference.
 *
 * A technology's name is written by hand in two kinds of place: on each
 * project, and in the skills inventory. The two are not always spelt alike
 * ("Next.js 14", "Solana development"), so a name is reduced to a key, and
 * the key is what ties the places together. Only a technology that turns up
 * in more than one place gets an entry: a name that appears once has nothing
 * to be cross-referenced with, and is left as plain text.
 *
 * Nothing here adds a fact. It only notices what the records already say.
 *
 * This module is imported by a client component, so it must not import the
 * project records themselves: doing so would ship all of their prose to the
 * browser. The records are passed in by the page, which is a server component.
 */

/**
 * Names that were written differently but are one thing. Keys are lower
 * case. Everything else is matched by its lower-cased name alone, so a new
 * spelling that should match an old one has to be listed here on purpose.
 */
const SAME_AS: Readonly<Record<string, string>> = {
  "next.js 14": "next.js",
  "tailwind css v4": "tailwind css",
  "solana development": "solana",
};

export function technologyKey(name: string): string {
  const key = name.trim().toLowerCase();
  return SAME_AS[key] ?? key;
}

/** One place a technology appears: an entry in the work index, or the skills. */
export type Place = {
  /** What the place is, so the place a reader started from can be left out. */
  id: string;
  /** How it is cited: "02.1" for the first work entry, "04" for the skills. */
  label: string;
  /** What it is called, for assistive technology. */
  title: string;
  href: string;
};

/** Keyed by technology; a key is present only if it has two places or more. */
export type TechIndex = Readonly<Record<string, readonly Place[]>>;

/** The part of a project this needs, so a test need not build a whole one. */
type Listed = { slug: string; name: string; technologies: readonly string[] };
type Inventory = { lines: readonly { items: readonly string[] }[] };

/**
 * The skills are one place however many groups a name sits in: Next.js is
 * under two of them, and both are "04".
 */
export const SKILLS_PLACE = "skills";

/** The id of the skills section, which Skills.tsx must carry. */
const SKILLS_HREF = "#skills";

export function buildTechIndex(
  projects: readonly Listed[],
  groups: readonly Inventory[],
  {
    numerals,
    anchorOf,
  }: {
    /** The margin numerals of the two sections the places live in. */
    numerals: { work: string; skills: string };
    /** The id of a project's entry in the work index. */
    anchorOf: (slug: string) => string;
  },
): TechIndex {
  const found = new Map<string, Place[]>();

  function add(name: string, place: Place) {
    const key = technologyKey(name);
    const places = found.get(key) ?? [];
    if (!places.some((existing) => existing.id === place.id)) {
      places.push(place);
    }
    found.set(key, places);
  }

  projects.forEach((project, position) => {
    const place: Place = {
      id: project.slug,
      label: `${numerals.work}.${position + 1}`,
      title: project.name,
      href: `#${anchorOf(project.slug)}`,
    };
    for (const name of project.technologies) add(name, place);
  });

  const skills: Place = {
    id: SKILLS_PLACE,
    label: numerals.skills,
    title: "Skills",
    href: SKILLS_HREF,
  };
  for (const group of groups) {
    for (const line of group.lines) {
      for (const name of line.items) add(name, skills);
    }
  }

  return Object.fromEntries(
    [...found].filter(([, places]) => places.length > 1),
  );
}

/** Where else a technology appears, from the place a reader is looking at. */
export function otherPlaces(
  index: TechIndex,
  key: string,
  own: string | undefined,
): readonly Place[] {
  if (!Object.hasOwn(index, key)) return [];
  return (index[key] ?? []).filter((place) => place.id !== own);
}

export const technologyHint =
  "Names ruled with a dotted line turn up in more than one place. Select one to see where.";
