/**
 * What the cave says at night. Short, and only when it has to: the cave is
 * mostly something to look at.
 */
export const cave = {
  embers: {
    /** Shown once, beside the embers, the first time the torch goes out. */
    hint: "torch's out. embers are still warm.",
    /** For assistive technology and the keyboard: what pressing them does. */
    label: "Relight the torch",
  },

  /** The bare stone at the back of the cave (/wall), and the way to it from every page. */
  wall: {
    href: "/wall",
    label: "The wall",
    title: "Write your history",
    invite: "There's bare stone at the back of the cave. Leave something on it.",
    go: "Go to the back of the cave",
    intro:
      "Paint with your finger, blow ochre round your hand, or write. Words go up in Brahmi, the script of Ashoka's edicts. It stays in your browser and nowhere else, and it weathers like the real thing.",
    empty: "Bare stone.",
    pigments: { ochre: "Ochre", white: "White clay", charcoal: "Charcoal" },
    tools: { paint: "Paint", hand: "Hand", write: "Write" },
    writing: "Write on the wall",
    wash: "Wash the wall",
    washSure: "Sure? It's gone for good",
    take: "Take it with you",
    unkept: "This browser isn't keeping anything for this site, so the wall goes when you leave.",
  },
} as const;
