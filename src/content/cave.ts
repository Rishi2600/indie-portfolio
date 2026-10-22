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
} as const;
