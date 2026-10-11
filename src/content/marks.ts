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
  stack: {
    label: "A small mark in the margin beside the stack",
    note: "Found it. The inked stuff I use. The pencilled stuff I'm eyeing.",
  },
  notes: {
    label: "A small mark in the margin beside the notes",
    note: "Breaking things is quick. Writing down why they broke takes longer. Hence the empty shelf.",
  },
  about: {
    label: "A small mark in the margin beside the about page",
    note: "This page used to read like a cover letter. Much better now.",
  },
} as const satisfies Record<string, Mark>;
