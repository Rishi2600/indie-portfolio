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
    note: "It's part of the day job at PinnTag, so I'd better learn it properly.",
  },
  {
    title: "System design",
    note: "Working out what the pieces are and how they meet, before any of them exist. Harder than it sounds.",
  },
  {
    title: "Web2",
    note: "Yes, the plain old web. Servers, databases, and whatever happens to a request in between.",
  },
  {
    title: "Solana development",
    note: "Programs on Solana, in Rust, with Anchor. Send snacks.",
  },
];

export const learningNote =
  "Four things I'm working through right now. Notes and repos will hang off these as I go.";
