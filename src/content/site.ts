/**
 * Site-level facts and structure.
 *
 * Everything here is either configuration or copy that appears in more than
 * one place. Section copy lives beside the section that renders it.
 */

export const site = {
  name: "Rishi",
  /** Used in the document title and the masthead dateline. */
  role: "Full-stack, backend and Solana developer",
  description:
    "Rishi — full-stack, backend and Solana developer, currently building backend systems at PinnTag.",
  /**
   * The canonical origin. Set NEXT_PUBLIC_SITE_URL in the deployment
   * environment; the localhost fallback keeps metadata valid in development
   * and makes a missing variable obvious rather than silent.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogLocale: "en_IN",
  /** Where this site's own source lives. Linked from the colophon. */
  repository: "https://github.com/Rishi2600/new-portfolio",
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
