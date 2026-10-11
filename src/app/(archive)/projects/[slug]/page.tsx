import type { ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { Turn } from "@/components/layout/Turn";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { TechIndexProvider } from "@/components/ui/TechIndex";
import { techIndex } from "@/content/crossref";
import {
  featuredProjects,
  projectBySlug,
  projectPath,
  type Project,
} from "@/content/projects";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

/**
 * Only what the index shows has a page. A project that is kept but not
 * featured is not linked from anywhere, and is not reachable by guessing its
 * address either: it is a 404, not a page rendered on request.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return featuredProjects.map(({ slug }) => ({ slug }));
}

function shown(slug: string): Project | undefined {
  const project = projectBySlug(slug);
  return project?.featured ? project : undefined;
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata) {
  const project = shown((await props.params).slug);
  if (!project) return {};
  return pageMetadata({
    title: project.name,
    description: project.summary,
    path: projectPath(project.slug),
  })(props, parent);
}

export default async function Page({ params }: Props) {
  const project = shown((await params).slug);
  if (!project) notFound();

  return (
    <Turn>
      <TechIndexProvider index={techIndex}>
        <ProjectDetail
          project={project}
          position={featuredProjects.indexOf(project) + 1}
        />
      </TechIndexProvider>
    </Turn>
  );
}
