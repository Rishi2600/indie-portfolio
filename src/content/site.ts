import { isIndexable, resolveSiteUrl, type Env } from "@/lib/site-url";

const env: Env = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
};

const siteEnv = { url: resolveSiteUrl(env), indexable: isIndexable(env) };

/**
 * Site-level facts and structure.
 *
 * Everything here is either configuration or copy that appears in more than
 * one place. Section copy lives beside the section that renders it.
 */

export const site = {
  name: "Rishi",
  /** Used in the document title and the masthead dateline. */
  role: "Full-stack, backend, Web3 and Solana developer",
  description:
    "Rishi — full-stack, backend, Web3 and Solana developer. Backend developer at PinnTag, working across APIs, databases, infrastructure, real-time systems and AI agents.",
  /**
   * The canonical origin; see src/lib/site-url.ts for the rules. The
   * variables are read by name, not by passing process.env along, so Next can
   * see exactly which ones this depends on.
   */
  url: siteEnv.url,
  /** Whether search engines should index this deployment at all. */
  indexable: siteEnv.indexable,
  ogLocale: "en_IN",
  /** Where this site's own source lives. Linked from the colophon. */
  repository: "https://github.com/Rishi2600/indie-portfolio",
  /**
   * The name as it is written in Devanagari. It appears twice, small, as a
   * signature rather than as decoration.
   */
  nameDevanagari: "ऋषि",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const nav: readonly NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Learning", href: "#learning" },
  { label: "About", href: "#about" },
  { label: "Notes", href: "#notes" },
  { label: "Contact", href: "#contact" },
];
