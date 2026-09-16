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
    title: "Breaking things, mostly",
    paragraphs: [
      "I like breaking things more than I like building them. Push on a system until something gives, then work out why — that is most of the fun.",
      "I like to experiment, and I will happily burn a lot of tokens doing it.",
      "I enjoy the difficult parts of engineering, the concepts that don't give themselves up on the first read. Solana and blockchains fascinate me, and hardware is fast becoming an obsession.",
    ],
    /**
     * The example the essay leans on. It is told here as part of the story
     * only; the project itself belongs to the work index, in its own phase.
     */
    example: {
      label: "A case in point",
      paragraphs: [
        "When work went remote, the team was spending around nine hours a day in a huddle call. So I built a GatherTown-like space from scratch to deal with it.",
        "The company uses it now.",
      ],
      principle: "Build things because you need them.",
    },
  },

  contact: {
    title: "Let's talk",
    body: "For interesting engineering problems, collaborations, or just a good technical conversation.",
  },
} as const;
