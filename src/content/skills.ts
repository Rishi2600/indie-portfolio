/**
 * The inventory.
 *
 * Grouped by how each thing gets used rather than by where it is usually
 * filed: Next.js appears under services and under interfaces because it is
 * used on both sides, and Anchor sits with Solana because that is what it is
 * for. A line's label says what the items on it have in common.
 *
 * Every item here was supplied by Rishi. Names are normalised to their
 * official spelling (Go, NestJS); nothing has been added.
 */

export type SkillLine = {
  /** What the items on this line share. Omitted when the group says it. */
  label?: string;
  items: readonly string[];
};

export type SkillGroup = {
  title: string;
  lines: readonly SkillLine[];
};

export const skillGroups: readonly SkillGroup[] = [
  {
    title: "Languages",
    lines: [{ items: ["Rust", "TypeScript", "Go", "Python"] }],
  },
  {
    title: "Services and APIs",
    lines: [
      { label: "Node", items: ["Express", "NestJS"] },
      { label: "Python", items: ["FastAPI", "Django"] },
      { label: "Full stack", items: ["Next.js"] },
    ],
  },
  {
    title: "Solana",
    lines: [
      { items: ["Solana development"] },
      { label: "Programs", items: ["Anchor"] },
    ],
  },
  {
    title: "Interfaces",
    lines: [
      { items: ["React", "Next.js"] },
      { label: "Styling", items: ["Tailwind CSS", "shadcn/ui"] },
      { label: "Motion, 3D", items: ["Framer Motion", "Three.js"] },
    ],
  },
  {
    title: "Data",
    lines: [
      { label: "SQL", items: ["PostgreSQL"] },
      { label: "NoSQL", items: ["MongoDB"] },
      { label: "Practice", items: ["Database optimization"] },
    ],
  },
  {
    title: "Infrastructure",
    lines: [
      {
        label: "Tools",
        items: ["Docker", "Kubernetes", "Nginx", "AWS EC2", "Jenkins"],
      },
      {
        label: "Practice",
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

export const skillsNote =
  "Grouped by how each thing gets used, not by where it is usually filed.";

/**
 * Not expertise. These are the things Rishi wants to get into next, and the
 * section sets them apart — lighter ink, a pencilled rule — so they are never
 * read as claims.
 */
export const exploring = {
  title: "Exploring",
  note: "Pencilled in, not inked: things I want to get into, not things I claim.",
  lines: [
    { label: "Real-time", items: ["Real-time systems", "WebRTC", "WebSockets"] },
    { label: "Tools", items: ["Browser-based IDEs", "Terminal UIs"] },
    { label: "AI", items: ["AI agents", "LLM internals", "Core ML"] },
    { label: "Physical", items: ["Robotics", "Hardware"] },
  ],
} as const satisfies { title: string; note: string; lines: readonly SkillLine[] };
