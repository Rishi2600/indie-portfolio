/**
 * Everything the site says about Rishi.
 *
 * The rule for this file: nothing goes in it that has not been confirmed.
 * Where the writing is still to come, the placeholder describes what will
 * replace it rather than pretending to be it.
 */

export const profile = {
  /** The opening. Two sentences, both literally true, neither of them a pitch. */
  opening: {
    lead: "I build backend systems at PinnTag.",
    body: "Full stack the rest of the time, Web3 and Solana included.",
  },

  now: {
    title: "What I'm doing now",
    paragraphs: [
      "Backend Developer at PinnTag, building backend systems.",
      "Full stack across the rest of my work, with Web3 and Solana alongside it.",
    ],
    facts: [
      { term: "Role", value: "Backend Developer" },
      { term: "Place", value: "PinnTag" },
      { term: "Working in", value: "Full stack · Backend · Web3 · Solana" },
    ],
    /** The day this section was last revised by hand, not the build date. */
    updated: "2026-09-16",
  },

  about: {
    title: "About",
    /** Replace `pending` with the real essay; delete this field when it lands. */
    pending: {
      heading: "Unwritten.",
      paragraphs: [
        "The longer piece goes here: what I enjoy building, what I am working through at the moment, which problems hold my attention, and what I have come to believe about software.",
      ],
    },
  },

  contact: {
    title: "Let's talk",
    body: "For interesting engineering problems, collaborations, or just a good technical conversation.",
  },
} as const;
