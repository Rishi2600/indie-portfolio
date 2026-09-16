import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  // A preview deployment is a public copy of the site at another address.
  if (!site.indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing under /api is a page, and the visit endpoint should not be
      // reached by anything that is not a reader's browser.
      disallow: "/api/",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
