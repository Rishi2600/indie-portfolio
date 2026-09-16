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

/** Shown while `notes` is empty. No topics are promised and none are listed. */
export const notesEmpty = {
  status: "No entries yet",
  note: "Nothing has been filed here yet. This part of the archive opens with its first entry.",
};
