/**
 * The work.
 *
 * Content only: nothing here knows how a project is displayed. The index
 * shows each one's teaser and nothing else; its own page has the rest.
 *
 * The rule is the same as everywhere else on this site: no fact is written
 * here that Rishi did not supply. The voice is his and casual; the numbers,
 * deployments and design decisions underneath it are exactly what he gave.
 * The repositories hold the long version, and the pages say so.
 */

export type EngineeringNote = {
  /** A few words naming the decision. */
  title: string;
  /** What was done, and why it is the interesting part. */
  body: string;
};

/**
 * How a project introduces itself in the index. They are not all alike on
 * purpose: one leads with its name, one with a line from the project, one
 * with a note scribbled in the margin beside it.
 */
export type Teaser =
  /** The name, then a line about it. */
  | { kind: "line"; text: string }
  /** A line from the project leads, and the name follows it. */
  | { kind: "quote"; text: string }
  /** The name and a line, with a note in the margin. */
  | { kind: "aside"; text: string; aside: string };

export type Project = {
  /**
   * Stable, hand-written, and the project's identity: it is the key for
   * lookups and the path its page lives at.
   */
  slug: string;
  name: string;
  /** Where the display name is not settled. Shown as a note, never guessed at. */
  nameNote?: string;
  teaser: Teaser;
  /** One plain sentence, for search results and link previews. */
  summary: string;
  /** What the thing does. */
  description: string;
  whyBuilt: string;
  /** The interesting parts. The project's page lists them; the index does not. */
  engineeringHighlights: readonly EngineeringNote[];
  technologies: readonly string[];
  /** A short factual label: a deployment, not a badge. Omitted when unknown. */
  status?: string;
  github: string;
  /** Only where one exists. An entry without it renders no live link. */
  live?: string;
  featured: boolean;
};

/**
 * In the order Rishi listed them, which is the order they are read in.
 *
 * Six are featured. The seventh is kept here whole and not shown: it is last
 * in the supplied order and its name is a working title, and that is the
 * whole reason. Flipping `featured` is all it takes to change which appear.
 */
export const projects: readonly Project[] = [
  {
    slug: "crm",
    name: "CRM",
    teaser: {
      kind: "line",
      text: "A sales CRM for an Indian sales team, from the first call to the closed deal. In rupees.",
    },
    summary:
      "A sales CRM built around an Indian sales team's lead-to-deal workflow.",
    description:
      "Leads come in, agents chase them with scheduled follow-up calls, and the ones that convert become deals on a drag-and-drop board. Then it tells you how it went: revenue, win rate, deal size, sales cycle, top performers.",
    whyBuilt:
      "I wanted to model a real sales workflow end to end, first contact to closed deal, with the team structure and the who-sees-what that comes with it.",
    technologies: [
      "Next.js 14",
      "App Router",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "JWT",
    ],
    engineeringHighlights: [
      {
        title: "Three levels of nosy",
        body: "Admins see everything. Managers see their own records and their team's. Reps see only their own.",
      },
      {
        title: "A seed script you can run twice",
        body: "It clears out its own previous data before reinserting, so seeding twice doesn't quietly pile up duplicates.",
      },
      {
        title: "Receipts",
        body: "The repo carries a product-lifecycle audit: what has actually been checked, and what's still open.",
      },
    ],
    status: "Demo deployment",
    github: "https://github.com/Rishi2600/crm",
    live: "https://crm-two-lovat-75.vercel.app/",
    featured: true,
  },
  {
    slug: "openbounty-v2",
    name: "OpenBounty-v2",
    teaser: {
      kind: "quote",
      text: "The reward sits in a program, not in somebody's pocket.",
    },
    summary:
      "Trustless on-chain bounties on Solana, where the reward is held by a program rather than by a person.",
    description:
      "A creator locks a reward into a program-controlled vault. Reviewers vote a winner through, the winner claims it, and whatever nobody claims goes back once the deadline passes.",
    whyBuilt:
      "Bounties have a trust problem. If you're doing the work, you want to know the reward exists, can't vanish, and pays out by rules nobody can quietly bend. So the code enforces all of it.",
    technologies: [
      "Rust",
      "Anchor",
      "Solana",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
    ],
    engineeringHighlights: [
      {
        title: "A vault with no private key",
        body: "Nobody owns the account the money sits in. The program does, and it won't let anyone pull the funds before the deadline.",
      },
      {
        title: "3-of-5, checked on chain",
        body: "Approval is a configurable 3-of-5 multisig vote with Ed25519 signatures verified on chain. Anyone can submit valid signatures, so there's no one privileged caller to trust.",
      },
      {
        title: "Claim it twice, get paid once",
        body: "Claiming is permissionless and idempotent. A refund only returns what nobody claimed, so the creator pays only for work that actually got rewarded.",
      },
    ],
    status: "Solana Devnet",
    github: "https://github.com/Rishi2600/OpenBounty-v2",
    live: "https://open-bounty-v2.vercel.app/",
    featured: true,
  },
  {
    slug: "iceplease",
    name: "IcePlease",
    teaser: {
      kind: "aside",
      text: "Shop, B2B enquiries and an admin dashboard for a flavoured-ice brand, all in one Next.js app.",
      aside: "House rule: the browser never gets to decide the price.",
    },
    summary:
      "The whole web platform for a packaged flavoured-ice brand: shop, enquiries and admin in one application.",
    description:
      "Customers browse, fill a cart, check out and keep an account. Businesses send enquiries. The brand runs its catalogue, orders, customers and analytics from the admin side.",
    whyBuilt:
      "A real brand needed to sell directly, take business enquiries and run its own catalogue and orders, without the site pretending to do things it can't.",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS v4",
      "Prisma",
      "PostgreSQL",
      "NextAuth",
      "Zod",
      "Docker",
    ],
    engineeringHighlights: [
      {
        title: "One place decides the price",
        body: "Money is stored as integer paise, and a single server-side pricing module drives both the cart and the order. The price you see and the price you pay come from the same place.",
      },
      {
        title: "Orders don't rewrite history",
        body: "An order snapshots what was bought, so editing a product later can't change an old order. Order status and payment status move separately, so paying offline now and through a gateway later both work.",
      },
      {
        title: "Tested where it costs money",
        body: "The smoke tests hit concurrent stock races and the order transaction against a real database. Not mocks.",
      },
      {
        title: "No made-up numbers",
        body: "Contact channels that aren't configured stay hidden, and the dashboard says straight out which metrics it can't honestly compute.",
      },
    ],
    status: "In production",
    github: "https://github.com/Rishi2600/IcePlease",
    live: "https://ice-please.vercel.app/",
    featured: true,
  },
  {
    slug: "daddy-solutions",
    name: "Daddy Solutions",
    teaser: {
      kind: "quote",
      text: "A consultancy site where you can skip the page, open a terminal and type help.",
    },
    summary:
      "A software consultancy's site whose central interaction is a working terminal in the browser.",
    description:
      "Read it like a normal page, or type commands to poke around the services, the tech and the process, or go straight to the contact form. A few of the commands aren't in the help text.",
    whyBuilt:
      "I wanted a consultancy site with actual personality that still reads like a company a CTO would hire. The jokes live in the copy; the layout keeps a straight face.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS v4", "xterm.js"],
    engineeringHighlights: [
      {
        title: "A terminal that arrives in three stages",
        body: "First a server-rendered deploy log that needs no JavaScript at all. Then a prefetch while the browser is idle, skipped on slow and data-saver connections. The live xterm session only loads once someone actually interacts.",
      },
      {
        title: "The shell can't disagree with the page",
        body: "The commands are a pure registry with no DOM anywhere near them, reading the same content file the page reads.",
      },
      {
        title: "Line editing, by hand",
        body: "History, tab completion, Ctrl+C and Ctrl+L. Commands can scroll the page or prefill the contact form. Nothing executes on a server.",
      },
    ],
    status: "Live",
    github: "https://github.com/Rishi2600/daddy-solutions",
    live: "https://daddy-solutions-wine.vercel.app/",
    featured: true,
  },
  {
    slug: "interviewhub",
    name: "InterviewHub",
    teaser: {
      kind: "aside",
      text: "Rooms for technical interviews and live coding contests, where everyone connected has to see the same thing at the same time.",
      aside: "No live link for this one. Clone it, run it, interview yourself.",
    },
    summary: "Real-time rooms for technical interviews and live coding contests.",
    description:
      "An interviewer opens a room, hands out a join code and runs the session: pins questions, chats with the candidate, moves the room from waiting to active to ended. Contest mode adds a leaderboard that moves as the scores do.",
    whyBuilt:
      "I wanted a system where state, roles and live updates all have to stay consistent for everyone connected at once. That's where it gets interesting.",
    technologies: [
      "NestJS",
      "MongoDB",
      "Mongoose",
      "WebSockets",
      "JWT",
      "Passport",
      "React",
    ],
    engineeringHighlights: [
      {
        title: "Same rules over both pipes",
        body: "Role-based access runs through a layered guard chain on HTTP and on WebSockets, so a real-time event hits the same wall an ordinary API request does.",
      },
      {
        title: "The room is a state machine",
        body: "Waiting, active, ended: explicit states, and the rest of the session is driven by them.",
      },
    ],
    github: "https://github.com/Rishi2600/InterviewHub",
    featured: true,
  },
  {
    slug: "delve",
    name: "delve",
    teaser: {
      kind: "quote",
      text: "Every directory becomes a room, every file becomes a monster.",
    },
    summary:
      "A terminal roguelike that turns a directory into a dungeon, and only ever reads it.",
    description:
      "Point it at a folder and play it. Folders are rooms, files are monsters: the extension picks the kind, the size picks how tough, the last edit picks whether it's awake. Your .gitignore hides the secret rooms. A freshly cloned repo is the worst case, because every file in it is hunting you.",
    whyBuilt:
      "I wanted to walk around my own projects instead of just listing them. Killing README.md and looting a Scroll of README.md is a bonus.",
    technologies: ["Rust", "ratatui", "crossterm", "clap"],
    engineeringHighlights: [
      {
        title: "Kill files, delete nothing",
        body: "It's strictly read-only. A test snapshots a folder (sizes, permissions, mtimes, content hashes, symlink targets) and checks it's identical after a scan and a 400-turn session of fighting and looting. Making the scanner write a file breaks it.",
      },
      {
        title: "Same folder, same dungeon",
        body: "A hand-written FNV-1a hash of the folder's path seeds ChaCha8, so a folder always gives you the same map.",
      },
      {
        title: "Secrets live in .gitignore",
        body: "Ignored folders become secret rooms behind secret doors you have to search for. Tougher monsters in there, better loot.",
      },
      {
        title: "A bot checks the balance",
        body: "A stair-diving bot has to be able to win and to lose on a just-cloned project. If it only ever does one, the tests fail.",
      },
    ],
    status: "On crates.io",
    github: "https://github.com/Rishi2600/delve",
    featured: true,
  },
  {
    slug: "pulse-analytics",
    name: "Pulse Analytics",
    nameNote: "working title",
    teaser: {
      kind: "line",
      text: "Self-serve product analytics: drop in a snippet, get dashboards.",
    },
    summary:
      "Self-serve product analytics: a snippet collects events, a scheduled job aggregates them, and teams explore the result.",
    description:
      "A small snippet collects events, an Edge Function takes them in, a five-minute job rolls them up, and teams dig through overview metrics, an event explorer, a live feed, funnels, retention cohorts and exports.",
    whyBuilt:
      "To build the whole pipeline (collection, ingestion, aggregation, querying, charts) and find out whether it stays fast as the events pile up.",
    technologies: [
      "Supabase",
      "PostgreSQL",
      "Row Level Security",
      "Edge Functions",
      "pg_cron",
      "Vite",
      "React",
      "TypeScript",
      "Playwright",
    ],
    engineeringHighlights: [
      {
        title: "Measured at a million events",
        body: "At a million events, dashboard queries come back within 300ms, and most take under 10ms.",
      },
      {
        title: "A snippet that doesn't lose events",
        body: "1.8 KB. It buffers, retries with backoff, survives refreshes and uses sendBeacon on the way out. Client-generated idempotency keys stop a retried batch being counted twice.",
      },
      {
        title: "Rollups by arrival, not by clock",
        body: "Aggregates recompute by arrival time, so late or offline events still land on the day they belong to.",
      },
      {
        title: "Secret keys stay secret",
        body: "CI scans the built bundle so secret keys never ship to the browser.",
      },
    ],
    status: "Multi-tenant product",
    github: "https://github.com/Rishi2600/Analytics-board-supabase",
    featured: false,
  },
];

/**
 * What the index shows, in the order above. Only these have a page of their
 * own: a project that is not featured is neither listed nor reachable.
 */
export const featuredProjects = projects.filter((project) => project.featured);

/** For the /projects/[slug] page, and for tests. */
export function projectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Where a project's own page lives. */
export function projectPath(slug: string): string {
  return `/projects/${slug}`;
}

/** The id of a project's entry in the work index, for links to it. */
export function projectAnchor(slug: string): string {
  return `work-${slug}`;
}

export const projectsIntro =
  "The short version. Each one has a page with the fun parts, and the repo has everything else.";

/** The seventh project, mentioned only in the margin of the index. */
export const drawerNote = {
  label: "A small mark in the margin beside the work",
  note: "There's a seventh one in the drawer. It doesn't have a proper name yet, so it stays in there.",
};
