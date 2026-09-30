import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { Colophon } from "@/components/layout/Colophon";
import { Folio } from "@/components/layout/Folio";
import { Masthead } from "@/components/layout/Masthead";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import {
  featuredProjects,
  neighbours,
  projectBySlug,
  projectPath,
  type Project,
} from "@/content/projects";
import { site } from "@/content/site";

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

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const project = shown((await params).slug);
  if (!project) return {};

  const path = projectPath(project.slug);
  const title = `${project.name} — ${site.name}`;
  const description = project.shortDescription;
  const { openGraph, twitter } = await parent;

  // Nested fields replace the layout's rather than merging with them, so
  // what this page shares with the rest of the site is stated again, and so
  // is the social card, which is the site's and comes from
  // opengraph-image.tsx: left out, a shared link would have no picture.
  return {
    title: project.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: path,
      locale: site.ogLocale,
      images: openGraph?.images ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: twitter?.creator ?? undefined,
      images: twitter?.images ?? undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const project = shown((await params).slug);
  if (!project) notFound();

  const { previous, next } = neighbours(project.slug);

  return (
    <>
      <a href="#content" className="skip">
        Skip to content
      </a>

      <Folio>
        <Masthead basePath="/" />

        <main id="content">
          <ProjectDetail
            project={project}
            position={featuredProjects.indexOf(project) + 1}
            previous={previous}
            next={next}
          />
        </main>

        <Colophon />
      </Folio>
    </>
  );
}
