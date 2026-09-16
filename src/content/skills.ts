export type SkillGroup = {
  title: string;
  skills: readonly string[];
};

/**
 * The categories are structure; the contents are not written yet.
 *
 * A skill list assembled by reading someone's job title back to them is a
 * guess, and a guess is worse than a gap, so every group is empty until the
 * real list exists.
 */
export const skillGroups: readonly SkillGroup[] = [
  { title: "Languages", skills: [] },
  { title: "Backend", skills: [] },
  { title: "Frontend", skills: [] },
  { title: "Web3 and Solana", skills: [] },
  { title: "Databases", skills: [] },
  { title: "Infrastructure", skills: [] },
  { title: "Tools", skills: [] },
];

export const skillsNote =
  "Empty on purpose. It stays that way until the list is accurate rather than plausible.";
