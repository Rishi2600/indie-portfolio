/**
 * The site read as a book: one line of pages from the front to the back.
 *
 * The home page comes first, then each chapter in turn, and the work chapter
 * carries its projects straight after it, the way a chapter carries its
 * sections. Turning a page, by link or by arrow key, moves one step along
 * this line, and which way a link points along it is which way the page
 * turns.
 *
 * Built on the server from the content and handed to the client as plain
 * data, so the browser is given the titles and addresses and nothing else.
 */

export type Leaf = {
  href: string;
  /** What the page is called, for the link that leads to it. */
  title: string;
  /** Its numeral, where it has one: "02", or "02.1" for a project. */
  numeral?: string;
};

export type ReadingOrder = readonly Leaf[];

type ChapterLike = { href: string; label: string; numeral: string; key: string };
type ProjectLike = { name: string; href: string };

export function buildReadingOrder(
  chapters: readonly ChapterLike[],
  projects: readonly ProjectLike[],
  { home = "/", workKey = "work" }: { home?: string; workKey?: string } = {},
): ReadingOrder {
  const order: Leaf[] = [{ href: home, title: "The start" }];
  for (const chapter of chapters) {
    order.push({ href: chapter.href, title: chapter.label, numeral: chapter.numeral });
    if (chapter.key === workKey) {
      projects.forEach((project, i) => {
        order.push({
          href: project.href,
          title: project.name,
          numeral: `${chapter.numeral}.${i + 1}`,
        });
      });
    }
  }
  return order;
}

/** Strips a trailing slash, so "/now/" and "/now" are one page. */
function normalise(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** Where a path is in the book, or -1 for a page that is not in it. */
export function placeOf(order: ReadingOrder, path: string): number {
  const at = normalise(path);
  return order.findIndex((leaf) => leaf.href === at);
}

/** The pages either side of this one; either is undefined at an end. */
export function around(
  order: ReadingOrder,
  path: string,
): { previous: Leaf | undefined; next: Leaf | undefined } {
  const at = placeOf(order, path);
  if (at === -1) return { previous: undefined, next: undefined };
  return { previous: order[at - 1], next: order[at + 1] };
}

export type TurnDirection = "nav-forward" | "nav-back";

/**
 * Which way the page turns going from one path to another: forward if the
 * destination is further into the book, back if it is nearer the front.
 * Nothing, if either is not in the book or they are the same page.
 */
export function turnBetween(
  order: ReadingOrder,
  from: string,
  to: string,
): TurnDirection | undefined {
  const a = placeOf(order, from);
  const b = placeOf(order, to);
  if (a === -1 || b === -1 || a === b) return undefined;
  return b > a ? "nav-forward" : "nav-back";
}
