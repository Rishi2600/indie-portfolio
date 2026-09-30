import { featuredProjects, projectAnchor } from "./projects";
import { sectionIndex } from "./site";
import { skillGroups } from "./skills";
import { buildTechIndex } from "./technologies";

/**
 * What the work index and the skills have in common, for the page as it is
 * built: every technology named in more than one place, and where.
 *
 * Kept apart from technologies.ts on purpose. That module is imported by a
 * client component and so has to stay light; this one holds the records and
 * is only ever imported by server components.
 */
export const techIndex = buildTechIndex(featuredProjects, skillGroups, {
  numerals: { work: sectionIndex.work, skills: sectionIndex.skills },
  anchorOf: projectAnchor,
});
