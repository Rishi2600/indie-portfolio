export type Note = {
  title: string;
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  summary: string;
};

export const notes: readonly Note[] = [];

export const notesIntro =
  "Where I'll write down what I learn, build, break and eventually understand.";

/** Shown while `notes` is empty. No topics are promised and none are listed. */
export const notesEmpty = {
  status: "Nothing yet",
  note: "The shelf is up. The books aren't. The first one goes here when it's written.",
};
