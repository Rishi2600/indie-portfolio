import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Birds } from "@/components/decorative/Birds";
import { PaperGrain } from "@/components/decorative/PaperGrain";
import { Rock } from "@/components/decorative/Rock";
import { Torch } from "@/components/decorative/Torch";
import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
import { themeScript } from "@/lib/theme";
import "@/styles/tokens.css";
import "@/styles/base.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    url: site.url,
    locale: site.ogLocale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
    creator: "@secur3shell",
  },
  robots: { index: site.indexable, follow: site.indexable },
};

/**
 * The browser's own chrome follows the reader's system: the theme colour is
 * read before any script runs, so a reader who has picked the other theme by
 * hand keeps the system's bar colour. The page itself always follows the
 * choice.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e9" },
    { media: "(prefers-color-scheme: dark)", color: "#252e3a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // base.css sets `scroll-behavior: smooth` for in-page links. Next 16 no
    // longer switches it off during a route change, so without this attribute
    // a new page opens where the last one was scrolled to and then sweeps up
    // to the top in front of the reader, showing the foot of the page on the
    // way. With it, Next makes that one jump instant and leaves smooth
    // scrolling to in-page links.
    //
    // data-theme is "day" as rendered and corrected by themeScript before the
    // first paint, which is why <html> may differ from what React rendered:
    // suppressHydrationWarning lets the attribute the script set stand.
    <html
      lang="en"
      className={fontVariables}
      data-scroll-behavior="smooth"
      data-theme="day"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Rock />
        <PaperGrain />
        <Birds />
        <div className="shell">
          {children}
          <Torch />
        </div>
      </body>
    </html>
  );
}
