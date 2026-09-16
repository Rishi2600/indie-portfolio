export type Note = {
  title: string;
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  summary: string;
};

export const notes: readonly Note[] = [];

export const notesIntro =
  "A place for the things I learn, build, break, and understand.";
