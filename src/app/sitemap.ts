import type { MetadataRoute } from "next";
import { featuredProjects, projectPath } from "@/content/projects";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // The site is statically built, so this is the time of the last deploy.
  const lastModified = new Date();

  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    // Only the projects that are featured have a page.
    ...featuredProjects.map((project) => ({
      url: `${site.url}${projectPath(project.slug)}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
