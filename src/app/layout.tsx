import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
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
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f1e9",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <PaperGrain />
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
