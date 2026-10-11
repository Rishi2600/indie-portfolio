import type { MetadataRoute } from "next";
import { readingOrder } from "@/content/reading";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // The site is statically built, so this is the time of the last deploy.
  const lastModified = new Date();

  // Every page of the book, front to back: the start, the chapters, and the
  // projects that are featured (only those have a page).
  return readingOrder.map((leaf) => ({
    url: leaf.href === "/" ? site.url : `${site.url}${leaf.href}`,
    lastModified,
    changeFrequency: leaf.href.startsWith("/projects/") ? ("yearly" as const) : ("monthly" as const),
    priority: leaf.href === "/" ? 1 : leaf.href.startsWith("/projects/") ? 0.6 : 0.8,
  }));
}
