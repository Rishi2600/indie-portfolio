/**
 * The work index.
 *
 * Content only: nothing here knows how a project is displayed. The index on
 * the home page renders a subset of these fields, and a future
 * /projects/[slug] page can render the rest from the same entries without
 * anything moving.
 *
 * The rule is the same as everywhere else on this site: no fact is written
 * here that Rishi did not supply. Numbers, deployments and test counts are
 * his; the wording is edited for the page. Nothing claims production scale,
 * users or mainnet where none was stated.
 */

export type EngineeringNote = {
  /** A few words naming the decision. */
  title: string;
  /** What was done, and why it is the interesting part. */
  body: string;
};

export type Project = {
  /**
   * Stable, hand-written, and the project's identity: it is the key for
   * lookups and the path a future detail page will live at. There is no
   * separate id, because a second stable key would only be a thing to keep
   * in step with this one.
   */
  slug: string;
  name: string;
  /** Where the display name is not settled. Shown as a note, never guessed at. */
  nameNote?: string;
  /** One line, for the index. */
  shortDescription: string;
  /** What the system actually does. */
  description: string;
  whyBuilt: string;
  /** What was built. Detail-page material; the index does not list it. */
  contribution: readonly string[];
  technologies: readonly string[];
  engineeringHighlights: readonly EngineeringNote[];
  /** How it is actually used or deployed, in factual terms. Detail-page
   *  material: the index carries the short `status` label instead. */
  usage: string;
  /** Why it earns a place here. Detail-page material. */
  portfolioReason: string;
  /** A short factual label — a deployment, not a status badge. Omitted when unknown. */
  status?: string;
  /** Not supplied for any project yet, so nothing displays a year. */
  year?: string;
  github: string;
  /** Only where one exists. An entry without it renders no live link. */
  live?: string;
  featured: boolean;
};

/**
 * In the order Rishi listed them, which is the order they are read in.
 *
 * Five are featured, which is the number the index is meant to hold. The
 * sixth is kept here in full and simply not shown: it is last in the supplied
 * order, and its name is a working title rather than a decided one. That is
 * the whole of the reason — it is not a judgement about the work — and
 * changing which five appear means flipping `featured`, nothing else.
 */
export const projects: readonly Project[] = [
  {
    slug: "crm",
    name: "CRM",
    shortDescription:
      "A sales CRM built around an Indian sales team's lead-to-deal workflow.",
    description:
      "Leads enter the system, agents work them through scheduled follow-up calls, and converted leads become deals on a drag-and-drop pipeline board. It tracks revenue, win rate, deal size, sales cycle and top performers, in rupees.",
    whyBuilt:
      "To model a real sales workflow end to end — first contact to closed deal — with the team structure and permission boundaries that implies.",
    contribution: [
      "Dashboard with revenue, pipeline, lead and follow-up insights",
      "Lead creation, importing, filtering and history",
      "Contacts, tasks and meetings",
      "A Kanban deals pipeline",
      "Follow-up tracking",
      "Analytics",
    ],
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
        title: "Three tiers of visibility",
        body: "Role-based access across admin, manager and representative. An admin sees everything, a manager their own records and their team's, a representative only their own.",
      },
      {
        title: "A seed script that can be run twice",
        body: "It clears its own previous data before reinserting, so seeding is idempotent instead of quietly accumulating duplicates.",
      },
      {
        title: "A written account of what was actually checked",
        body: "The repository carries a product-lifecycle audit recording what has been verified and what is still open.",
      },
    ],
    usage:
      "Built around an Indian sales team's lead-to-deal workflow, with seeded demo accounts for each role.",
    portfolioReason:
      "A complete multi-role business application: relational data, business workflows, and permission boundaries between roles.",
    status: "Demo deployment",
    github: "https://github.com/Rishi2600/crm",
    live: "https://crm-two-lovat-75.vercel.app/",
    featured: true,
  },
  {
    slug: "openbounty-v2",
    name: "OpenBounty-v2",
    shortDescription:
      "Trustless on-chain bounties, where the reward is held by a program rather than by a person.",
    description:
      "A creator locks a reward into a program-controlled vault. Reviewers approve a winner by threshold vote, the winner claims the reward, and anything unclaimed is refunded once the deadline passes.",
    whyBuilt:
      "Bounties have a trust problem: whoever does the work needs to know the reward exists, cannot quietly disappear, and will pay out by rules that are actually enforced. This makes escrow, approval and payout enforceable by code.",
    contribution: [
      "An Anchor program with four lifecycle instructions: initialise escrow, finalise winner, claim prize, refund unclaimed",
      "Two PDAs — escrow metadata and the SOL vault",
      "15 custom errors and 19 tests, covering success paths, edge cases and attack prevention",
      "A frontend for Phantom and Backpack on Solana Devnet",
    ],
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
        body: "The funds are program-controlled rather than sitting in an account somebody owns, and cannot be withdrawn before the deadline.",
      },
      {
        title: "Threshold approval, verified on chain",
        body: "A configurable 3-of-5 multisignature vote with Ed25519 signature verification. Anyone may submit valid signatures, so approval does not depend on one privileged caller.",
      },
      {
        title: "Claims that can be retried safely",
        body: "Claiming is permissionless and idempotent, so a prize cannot be claimed twice, and a refund only returns what nobody claimed — the creator pays only for work that was actually rewarded.",
      },
    ],
    usage: "Deployed to Solana Devnet with a live frontend.",
    portfolioReason:
      "Smart-contract design with security thinking behind it: signature verification, idempotency, deadline-based access control, and the dApp wired around it.",
    status: "Solana Devnet",
    github: "https://github.com/Rishi2600/OpenBounty-v2",
    live: "https://open-bounty-v2.vercel.app/",
    featured: true,
  },
  {
    slug: "iceplease",
    name: "IcePlease",
    shortDescription:
      "The whole web platform for a packaged flavoured-ice brand: shop, enquiries and admin in one application.",
    description:
      "A brand site, a product catalogue, consumer ordering, B2B enquiries and an admin dashboard, all inside one Next.js application.",
    whyBuilt:
      "To give a real consumer brand what it needs to sell directly, take business enquiries and manage its own catalogue and orders — without pretending it has functionality it does not.",
    contribution: [
      "Public: shop, cart, checkout, customer accounts, B2B enquiry flow",
      "Admin: catalogue, orders, customers, enquiries, analytics",
      "Server-side authorization throughout",
      "A smoke-test suite covering the money and stock paths against a real database",
    ],
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
        title: "One authority for the price",
        body: "Money is stored as integer paise, and a single server-side pricing module drives both the cart and order creation — so the price shown and the price charged come from the same place. The browser never gets to decide.",
      },
      {
        title: "Orders that stay true after the fact",
        body: "An order snapshots what was bought, so editing a product later cannot rewrite history. Order status and payment status move independently, which supports paying offline now and a gateway later.",
      },
      {
        title: "Tested where it costs money",
        body: "The smoke tests cover concurrent stock races and the order transaction against a real database, rather than against mocks.",
      },
      {
        title: "Nothing invented on the dashboard",
        body: "Contact channels that are not configured stay hidden, and the dashboard says plainly which metrics it cannot honestly compute.",
      },
    ],
    usage:
      "Built as the production web application for the IcePlease brand, for consumer orders and business enquiries.",
    portfolioReason:
      "E-commerce engineering in the places where correctness actually matters: pricing authority, transactional orders, stock handling, data integrity.",
    status: "Production web application",
    github: "https://github.com/Rishi2600/IcePlease",
    live: "https://ice-please.vercel.app/",
    featured: true,
  },
  {
    slug: "daddy-solutions",
    name: "Daddy Solutions",
    shortDescription:
      "A software consultancy's site whose central interaction is a working terminal in the browser.",
    description:
      "Visitors can read the page as a page, or type commands to explore the services, the technology and the process — or go straight to the contact form.",
    whyBuilt:
      "To build a consultancy site with real personality that still reads like a company a CTO could hire. The humour lives in the copy; the layout stays professional.",
    contribution: [
      "Hero, services, why-us, process, Solana section, tech stack and contact",
      "A custom design system with no UI dependencies",
      "An interactive xterm.js terminal",
      "SEO, JSON-LD, generated OG images and a sitemap",
      "A contact API with validation, a honeypot and rate limiting",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS v4", "xterm.js"],
    engineeringHighlights: [
      {
        title: "A terminal that arrives in three stages",
        body: "First a server-rendered deploy log, which needs no JavaScript at all. Then a prefetch while the browser is idle, skipped on slow and data-saver connections. Only when someone actually interacts does the live xterm session load.",
      },
      {
        title: "A shell that cannot drift from the page",
        body: "The commands are a pure registry with no DOM dependencies, reading the same content file the page reads, so the terminal and the page cannot end up disagreeing.",
      },
      {
        title: "Line editing written by hand",
        body: "History, tab completion, Ctrl+C and Ctrl+L. Commands can scroll the page or prefill the contact form, and a few of them are not in the help text. Nothing executes on a server.",
      },
    ],
    usage:
      "The public site for Daddy Solutions, with a working contact form for project briefs.",
    portfolioReason:
      "Frontend engineering: performance-aware loading, custom interaction design, a design system built from nothing, SEO and accessibility.",
    status: "Public website",
    github: "https://github.com/Rishi2600/daddy-solutions",
    live: "https://daddy-solutions-wine.vercel.app/",
    featured: true,
  },
  {
    slug: "interviewhub",
    name: "InterviewHub",
    shortDescription:
      "Real-time rooms for technical interviews and live coding contests.",
    description:
      "An interviewer opens a room, hands out a join code and runs a structured session: pinning questions, chatting with the candidate, moving the room from waiting to active to ended. Contest mode adds a leaderboard that updates as scores change.",
    whyBuilt:
      "To build a system where state, roles and live updates all have to stay consistent across everyone connected at once.",
    contribution: [
      "Interview rooms with unique join codes",
      "A session lifecycle: waiting, active, ended",
      "Question pinning",
      "WebSocket chat with typing indicators and message history",
      "A separate contest mode with a live leaderboard",
    ],
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
        title: "The same permissions over both transports",
        body: "Role-based access is enforced through a layered guard chain across HTTP and WebSockets, so a real-time event meets the same boundary an ordinary API request does.",
      },
      {
        title: "A session that is a state machine",
        body: "The room's lifecycle is modelled as explicit states — waiting, active, ended — and the rest of the session is driven by them.",
      },
    ],
    usage: "Built for technical interviewers and coding contest organisers.",
    portfolioReason:
      "Real-time communication, backend architecture, session state machines, and authorization that holds across more than one transport.",
    github: "https://github.com/Rishi2600/InterviewHub",
    featured: true,
  },
  {
    slug: "pulse-analytics",
    name: "Pulse Analytics",
    nameNote: "working title",
    shortDescription:
      "Self-serve product analytics: a snippet collects events, a scheduled job aggregates them, and teams explore the result.",
    description:
      "Customers install a small tracking snippet. Events flow through ingestion, a five-minute job rolls them into aggregates, and teams explore overview metrics, an event explorer, a live feed, funnels, retention cohorts and exports.",
    whyBuilt:
      "To build a full pipeline — collection, ingestion, aggregation, querying, visualisation — and find out whether it stays fast as the volume of events grows.",
    contribution: [
      "A 1.8 KB tracking snippet, an ingestion Edge Function and an export Edge Function",
      "A five-minute rollup job",
      "Overview dashboard with period comparison, event explorer, saved views and a live WebSocket feed",
      "Funnels, retention, CSV and JSON export, and an ingestion health screen",
      "Organizations, projects, four levels of role, and public and secret API keys",
      "28 unit tests, 63 database and integration tests, 10 end-to-end tests",
    ],
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
        body: "At one million events, dashboard queries return within 300ms and most of them take under 10ms.",
      },
      {
        title: "A snippet that does not lose events",
        body: "1.8 KB, buffering, retrying with backoff, surviving refreshes and using sendBeacon on the way out. Client-generated idempotency keys stop a retried batch being counted twice.",
      },
      {
        title: "Rollups by arrival, not by clock",
        body: "Aggregates recompute by arrival time, so events that were delayed or collected offline still land on the day they belong to.",
      },
      {
        title: "Keys that cannot leak into the browser",
        body: "CI scans the built bundle to keep secret keys out of what ships to the client.",
      },
    ],
    usage:
      "A working multi-tenant analytics product; an application integrates it with the snippet and an API key.",
    portfolioReason:
      "A data pipeline end to end: ingestion, aggregation, querying, security boundaries, multi-tenancy, measured performance and tests at three levels.",
    status: "Multi-tenant product",
    github: "https://github.com/Rishi2600/Analytics-board-supabase",
    featured: false,
  },
];

/** What the index shows, in the order above. */
export const featuredProjects = projects.filter((project) => project.featured);

/** For a future /projects/[slug] page, and for tests. */
export function projectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const projectsNote =
  "What I have built, why I built it, and the part of each one I found interesting. Every entry links to its source.";
