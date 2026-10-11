export type LearningEntry = {
  title: string;
  /** One line on what the subject is, or why it is on the list. */
  note?: string;
  /** Where a subject is broad, the parts of it being worked through. */
  topics?: readonly string[];
};

/**
 * The four subjects Rishi is learning now. The notes say what each one is
 * and where it touches his own work, and a broad subject names the parts of
 * it he is working through; none of them claims progress, a reading list or
 * a result.
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
    title: "Blockchain and protocol engineering",
    note: "Not just writing contracts on top of a chain: how the chains themselves are built, and why they behave the way they do.",
    topics: ["Solana", "EVM", "Hyperliquid"],
  },
  {
    title: "Reverse engineering",
    note: "System level only. Pulling compiled binaries apart to see what the machine actually runs: assembly, registers, the stack and the heap, calling conventions, syscalls, and where the program stops and the OS takes over.",
  },
];

export const learningNote =
  "Four things I'm working through right now. Notes and repos will hang off these as I go.";
