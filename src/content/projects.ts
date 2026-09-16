export type Project = {
  title: string;
  description: string;
  technologies: readonly string[];
  /** Four digits. Sorting and display both assume it. */
  year?: string;
  category?: string;
  githubUrl?: string;
  liveUrl?: string;
  /** A featured project is set larger and listed first. */
  featured?: boolean;
};

/**
 * Deliberately empty.
 *
 * The candidates are at github.com/Rishi2600, but which of them belong on a
 * portfolio is a decision, not a query — so nothing is listed until it has
 * been chosen. The section renders a ruled, unfilled index in the meantime.
 */
export const projects: readonly Project[] = [];

export const projectsNote =
  "The index is still being set. Each entry will carry its year, what it was built with, and a link to the source.";
