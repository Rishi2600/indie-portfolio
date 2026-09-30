/**
 * The small marks left in the margins: a rosette that opens a short note when
 * it is clicked. They are for whoever goes looking, and nothing on the page
 * depends on them.
 *
 * The notes are asides in Rishi's voice rather than facts about his work, so
 * the rule that nothing is written here that he did not supply is kept by
 * saying nothing that could be wrong. They are also the easiest lines on the
 * site to rewrite.
 */

export type Mark = {
  /** What assistive technology calls the button. */
  label: string;
  note: string;
};

export const marks = {
  skills: {
    label: "A small mark in the margin beside the skills",
    note: "Found it. The inked list is what I work with; the pencilled part is what I would like to.",
  },
  notes: {
    label: "A small mark in the margin beside the notes",
    note: "Nothing is filed yet, but the shelf is ruled. Breaking things is quick; writing down why they broke takes longer.",
  },
} as const satisfies Record<string, Mark>;
