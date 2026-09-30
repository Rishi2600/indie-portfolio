import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Birds } from "@/components/decorative/Birds";
import { PaperGrain } from "@/components/decorative/PaperGrain";
import { site } from "@/content/site";
import { fontVariables } from "@/lib/fonts";
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

export const viewport: Viewport = {
  themeColor: "#f4f1e9",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // base.css sets `scroll-behavior: smooth` for in-page links. Next 16 no
    // longer switches it off during a route change, so without this attribute
    // a new page opens where the last one was scrolled to and then sweeps up
    // to the top in front of the reader, showing the foot of the page on the
    // way. With it, Next makes that one jump instant and leaves smooth
    // scrolling to in-page links.
    <html lang="en" className={fontVariables} data-scroll-behavior="smooth">
      <body>
        <PaperGrain />
        <Birds />
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
