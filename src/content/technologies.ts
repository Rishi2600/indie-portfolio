/**
 * The technology cross-reference.
 *
 * A technology's name is written by hand in two kinds of place: on each
 * project, and in the stack. The two are not always spelt alike
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

/** One place a technology appears: a project's page, or the stack. */
export type Place = {
  /** What the place is, so the place a reader started from can be left out. */
  id: string;
  /** How it is cited: "02.1" for the first project, "03" for the stack. */
  label: string;
  /** What it is called, for assistive technology. */
  title: string;
  href: string;
};

/** Keyed by technology; a key is present only if it has two places or more. */
export type TechIndex = Readonly<Record<string, readonly Place[]>>;

/** The part of a project this needs, so a test need not build a whole one. */
type Listed = { slug: string; name: string; technologies: readonly string[] };

/** The stack is one place however many times a name turns up in it. */
export const SKILLS_PLACE = "stack";

export function buildTechIndex(
  projects: readonly Listed[],
  /** Every name in the stack, in any order, repeats and all. */
  inventory: readonly string[],
  {
    numerals,
    projectHref,
    stackHref,
  }: {
    /** The margin numerals of the two chapters the places live in. */
    numerals: { work: string; stack: string };
    /** Where a project's page is. */
    projectHref: (slug: string) => string;
    /** Where the stack is. */
    stackHref: string;
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
      href: projectHref(project.slug),
    };
    for (const name of project.technologies) add(name, place);
  });

  const stack: Place = {
    id: SKILLS_PLACE,
    label: numerals.stack,
    title: "Stack",
    href: stackHref,
  };
  for (const name of inventory) add(name, stack);

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
  "Names with a dotted line show up in more than one place. Click one to see where.";
