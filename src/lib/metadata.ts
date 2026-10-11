import type { Metadata, ResolvingMetadata } from "next";
import { site } from "@/content/site";

/**
 * Metadata for one page of the archive: its own title, description and
 * canonical address, and the site's social card.
 *
 * Nested fields replace the layout's rather than merging with them, so what
 * a page shares with the rest of the site is stated again, and so is the
 * card, which is the site's and comes from opengraph-image.tsx: left out, a
 * shared link would have no picture.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return async (
    _props: unknown,
    parent: ResolvingMetadata,
  ): Promise<Metadata> => {
    const { openGraph, twitter } = await parent;
    const full = `${title} — ${site.name}`;
    return {
      title,
      description,
      alternates: { canonical: path },
      openGraph: {
        type: "website",
        siteName: site.name,
        title: full,
        description,
        url: path,
        locale: site.ogLocale,
        images: openGraph?.images ?? undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: full,
        description,
        creator: twitter?.creator ?? undefined,
        images: twitter?.images ?? undefined,
      },
    };
  };
}
