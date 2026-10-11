import { buildReadingOrder } from "@/lib/reading-order";
import { featuredProjects, projectPath } from "./projects";
import { chapters } from "./site";

/**
 * The whole site as one line of pages, front to back (lib/reading-order.ts).
 * Built here, on the server, so the client is handed titles and addresses
 * and none of the records behind them.
 */
export const readingOrder = buildReadingOrder(
  chapters,
  featuredProjects.map((project) => ({
    name: project.name,
    href: projectPath(project.slug),
  })),
);
