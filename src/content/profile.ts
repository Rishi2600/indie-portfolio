/**
 * Everything the site says about Rishi.
 *
 * The rule for this file: nothing goes in it that Rishi has not supplied.
 * The wording is editorial; the facts underneath it are not. Where a
 * sentence paraphrases, it paraphrases something he said, and it never adds
 * a number, a product, a responsibility or a technology he did not name.
 */

export const profile = {
  opening: {
    lead: "I build backend systems at PinnTag.",
    body: "Full-stack developer and open-source contributor, with Web3 and Solana in the mix.",
  },

  now: {
    title: "What I'm doing now",
    paragraphs: [
      "I'm a backend developer at PinnTag. The work runs from backend APIs down to the databases and infrastructure beneath them, across distributed and real-time systems, and out to the newer ground of AI agents.",
      "Beyond the four subjects under Currently learning, I'm increasingly pulled towards hardware, AI agents and real-time systems.",
    ],
    facts: [
      { term: "Role", value: "Backend developer" },
      { term: "At", value: "PinnTag" },
      { term: "Also", value: "Full-stack developer, open-source contributor" },
      { term: "On my mind", value: "Hardware · AI agents · Real-time systems" },
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
