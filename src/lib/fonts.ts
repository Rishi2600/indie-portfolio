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

/**
 * Roman only. The italic is a second 47kB file, and the one word on the site
 * that wanted it — the "Unwritten." standing in for the About essay — is not
 * worth an eighth of the page's weight. Add `style: ["normal", "italic"]`
 * back the moment there is real prose here with something to emphasise.
 */
export const garamond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-garamond",
});

/** 400 only: nothing on the page sets interface text at 500. */
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-plex-sans",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

/**
 * The most expensive thing on the site per character: 51kB to set three
 * glyphs, twice. It is not preloaded, so it arrives after the first paint and
 * blocks nothing, and what it buys is the name in the other script it is
 * written in, as real selectable text rather than as a picture of text.
 *
 * If that trade stops being worth it, the fix is not to delete the mark but
 * to subset the face: Google will serve a font containing only the glyphs in
 * `&text=`, which for these three is a couple of kilobytes, loaded through
 * next/font/local from a file in the repository. That is a licence notice and
 * a binary to carry, which is why it is not the first version.
 */
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
