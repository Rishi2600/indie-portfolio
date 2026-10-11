/**
 * Everything the site says about Rishi, in his voice.
 *
 * The rule for this file: nothing goes in it that Rishi has not supplied.
 * The tone is casual and the jokes are the page's; the facts underneath them
 * are not. A sentence may paraphrase something he said, but it never adds a
 * number, a product, a responsibility or a technology he did not name.
 */

export const profile = {
  opening: {
    lead: "I write backends for a living at PinnTag, and break things for fun.",
    body: "Full-stack when I need to be, open source when I can, and a little too into Web3 and Solana.",
    /**
     * The things he says he cannot stop thinking about. The opening shows one
     * at a time and the reader can flip through them.
     */
    obsessions: {
      before: "Lately I can't stop thinking about",
      items: ["hardware", "AI agents", "real-time systems"],
    },
  },

  now: {
    title: "What I'm up to",
    paragraphs: [
      "Day job: backend developer at PinnTag. That covers a lot of ground: APIs, the databases and infrastructure under them, distributed and real-time systems, and lately AI agents too.",
      "Outside of that I keep drifting towards hardware. And AI agents. And real-time systems. It's becoming a problem.",
    ],
    /** The day this page was last rewritten by hand, not the build date. */
    updated: "2026-09-16",
  },

  about: {
    title: "Breaking things, mostly",
    paragraphs: [
      "I like breaking things more than I like building them. Push on a system until something gives, then figure out why. That's most of the fun.",
      "I like to experiment, and I'll happily burn a lot of tokens doing it.",
      "I like the hard parts, the ideas that don't give themselves up on the first read. Solana and blockchains fascinate me, and hardware is fast turning into an obsession.",
    ],
    /** The story the page leans on. The project itself is not in the work. */
    example: {
      label: "Case in point",
      paragraphs: [
        "When work went remote, the team was spending about nine hours a day in a huddle call. So I built a GatherTown-style space from scratch to deal with it.",
        "The company uses it now.",
      ],
      principle: "Moral of the story: build the thing you need.",
    },
  },

  contact: {
    title: "Say hi",
    body: "Got an interesting engineering problem, a collab, or just want to talk shop? I'm around.",
  },
} as const;
