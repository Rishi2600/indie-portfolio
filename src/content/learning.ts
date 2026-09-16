export type LearningEntry = {
  title: string;
  /** One line on what the subject is, or why it is on the list. */
  note?: string;
};

/**
 * The four subjects Rishi is learning now. The notes say what each one is
 * and where it touches his own work; none of them claims progress, a reading
 * list or a result.
 */
export const learning: readonly LearningEntry[] = [
  {
    title: "Distributed systems",
    note: "Part of the day job at PinnTag, which is reason enough to learn it properly.",
  },
  {
    title: "System design",
    note: "Deciding what the pieces are and how they meet, before any of them exist.",
  },
  {
    title: "Web2",
    note: "The ordinary web: servers, databases, and what happens to a request between them.",
  },
  {
    title: "Solana development",
    note: "Programs on Solana, in Rust, with Anchor.",
  },
];

export const learningNote =
  "The four subjects I am working through at the moment. Notes, papers and repositories will hang off these entries as the archive grows.";
