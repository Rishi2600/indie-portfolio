export type LearningEntry = {
  title: string;
  /** One line on why, or what is being read. Optional, and absent for now. */
  note?: string;
};

/**
 * The four things confirmed as current interests. This is the one placeholder
 * section that is not a placeholder.
 */
export const learning: readonly LearningEntry[] = [
  { title: "Distributed systems" },
  { title: "System design" },
  { title: "Web2" },
  { title: "Solana development" },
];

export const learningNote =
  "The four things I am learning about at the moment. Notes, papers and repositories will hang off these entries as they accumulate.";
