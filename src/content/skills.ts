/**
 * The stack.
 *
 * Every name here was supplied by Rishi, normalised to its official spelling
 * (Go, NestJS); nothing has been added. What changes from group to group is
 * how it is written down. A toolbox is not a form, so the groups do not share
 * one: some are a row of names, some are a sentence, some are a ledger.
 */

export type SkillLine = {
  /** What the items on this line share. Omitted when the group says it. */
  label?: string;
  items: readonly string[];
};

/** Plain words, or the name of a technology the reader can look up. */
export type Phrase = string | { tech: string };

export type StackGroup =
  /** Set large, a row of names and nothing else. */
  | { form: "names"; title: string; items: readonly string[] }
  /** Written out as a sentence, with the names inside it. */
  | { form: "sentence"; title: string; says: readonly Phrase[] }
  /** The ledger: small labelled lines. */
  | { form: "lines"; title: string; lines: readonly SkillLine[] };

export const stack: readonly StackGroup[] = [
  {
    form: "names",
    title: "Languages",
    items: ["Rust", "TypeScript", "Go", "Python"],
  },
  {
    form: "sentence",
    title: "Backends",
    says: [
      "On Node, ",
      { tech: "Express" },
      " or ",
      { tech: "NestJS" },
      ". On Python, ",
      { tech: "FastAPI" },
      " or ",
      { tech: "Django" },
      ". And ",
      { tech: "Next.js" },
      " when the whole thing fits in one app.",
    ],
  },
  {
    form: "sentence",
    title: "Solana",
    says: ["Programs on ", { tech: "Solana" }, ", written with ", { tech: "Anchor" }, "."],
  },
  {
    form: "lines",
    title: "Frontend",
    lines: [
      { items: ["React", "Next.js"] },
      { label: "Styling", items: ["Tailwind CSS", "shadcn/ui"] },
      { label: "Motion, 3D", items: ["Framer Motion", "Three.js"] },
    ],
  },
  {
    form: "sentence",
    title: "Data",
    says: [
      { tech: "PostgreSQL" },
      " when it's relational, ",
      { tech: "MongoDB" },
      " when it isn't, and a soft spot for making slow queries fast.",
    ],
  },
  {
    form: "lines",
    title: "Infra",
    lines: [
      {
        label: "Run",
        items: ["Docker", "Kubernetes", "Nginx", "AWS EC2", "Jenkins"],
      },
      {
        label: "Know",
        items: [
          "Reverse proxies",
          "Virtual machines",
          "Container orchestration",
          "Operations at scale",
        ],
      },
    ],
  },
];

/** Every technology the stack names, in order, whatever form it is written in. */
export function stackNames(groups: readonly StackGroup[]): string[] {
  return groups.flatMap((group) => {
    if (group.form === "names") return [...group.items];
    if (group.form === "lines") return group.lines.flatMap((line) => line.items);
    return group.says.flatMap((phrase) => (typeof phrase === "string" ? [] : [phrase.tech]));
  });
}

export const stackIntro =
  "What I actually build with. It's grouped however made sense to write down, which is not the same way every time.";

/**
 * Not expertise. These are the things Rishi wants to get into next, set apart
 * in a lighter hand so they are never read as claims.
 */
export const exploring = {
  title: "Pencilled in",
  note: "Not claims. Just the stuff I want to get my hands on next.",
  lines: [
    { label: "Real-time", items: ["Real-time systems", "WebRTC", "WebSockets"] },
    { label: "Tools", items: ["Browser-based IDEs", "Terminal UIs"] },
    { label: "AI", items: ["AI agents", "LLM internals", "Core ML"] },
    { label: "Physical", items: ["Robotics", "Hardware"] },
  ],
} as const satisfies { title: string; note: string; lines: readonly SkillLine[] };
