import { featuredProjects, projectPath } from "./projects";
import { chapter, sectionIndex } from "./site";
import { stack, stackNames } from "./skills";
import { buildTechIndex } from "./technologies";

/**
 * What the projects and the stack have in common: every technology named in
 * more than one place, and where.
 *
 * Kept apart from technologies.ts on purpose. That module is imported by a
 * client component and so has to stay light; this one holds the records and
 * is only ever imported by server components.
 */
export const techIndex = buildTechIndex(featuredProjects, stackNames(stack), {
  numerals: { work: sectionIndex.work, stack: sectionIndex.stack },
  projectHref: projectPath,
  stackHref: chapter("stack").href,
});
