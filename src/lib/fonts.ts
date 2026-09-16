import {
  EB_Garamond,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Devanagari,
} from "next/font/google";

/**
 * Four faces, each with one job.
 *
 * EB Garamond is a garalde in the Claude Garamond line — the shape most
 * printed books have used for four hundred years — and carries everything
 * that is read as prose. IBM Plex Sans handles interface text and IBM Plex
 * Mono handles metadata, which keeps the two non-prose registers inside a
 * single family. IBM Plex Sans Devanagari sets the one Devanagari line on
 * the site and is deliberately not preloaded: a handful of glyphs is not
 * worth blocking the first paint for.
 */

export const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-garamond",
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-sans",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const plexDevanagari = IBM_Plex_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400"],
  display: "swap",
  preload: false,
  variable: "--font-plex-devanagari",
});

export const fontVariables = [
  garamond.variable,
  plexSans.variable,
  plexMono.variable,
  plexDevanagari.variable,
].join(" ");
