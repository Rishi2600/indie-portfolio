import { describe, expect, it } from "vitest";
import { featuredProjects, projectBySlug, projects } from "./projects";

/**
 * The project records are hand-written, and the mistakes hand-written data
 * invites are the ones worth catching: a slug that collides, a link that is
 * not a link, a field left empty, two entries that would collide as React
 * keys. None of this tests prose.
 */

const FEATURED_COUNT = 5;

describe("the archive", () => {
  it("holds every candidate, featured or not", () => {
    expect(projects.length).toBeGreaterThanOrEqual(FEATURED_COUNT);
  });

  it("features exactly the number the index is built to hold", () => {
    expect(featuredProjects).toHaveLength(FEATURED_COUNT);
  });

  it("keeps the unfeatured candidates whole rather than deleting them", () => {
    const unfeatured = projects.filter((p) => !p.featured);
    for (const project of unfeatured) {
      expect(project.name).toBeTruthy();
      expect(project.github).toBeTruthy();
      expect(project.engineeringHighlights.length).toBeGreaterThan(0);
    }
  });

  it("lists featured projects in the order they are written", () => {
    const order = projects.filter((p) => p.featured).map((p) => p.slug);
    expect(featuredProjects.map((p) => p.slug)).toEqual(order);
  });
});

describe("identity", () => {
  it("gives every project a unique slug", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses slugs that can be a URL path unchanged", () => {
    for (const project of projects) {
      expect(project.slug, project.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(encodeURIComponent(project.slug)).toBe(project.slug);
    }
  });

  it("gives every project a unique name", () => {
    const names = projects.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("finds a project by its slug, and nothing by a slug that is not one", () => {
    for (const project of projects) {
      expect(projectBySlug(project.slug)).toBe(project);
    }
    expect(projectBySlug("no-such-project")).toBeUndefined();
  });
});

describe("links", () => {
  it("gives every project a source repository", () => {
    for (const project of projects) {
      const url = new URL(project.github);
      expect(url.protocol, project.name).toBe("https:");
      expect(url.hostname, project.name).toBe("github.com");
      expect(url.pathname, project.name).toMatch(/^\/[\w.-]+\/[\w.-]+$/);
    }
  });

  it("has no repository listed twice", () => {
    const repos = projects.map((p) => p.github.toLowerCase());
    expect(new Set(repos).size).toBe(repos.length);
  });

  it("either has a real live URL or none at all", () => {
    for (const project of projects) {
      if (project.live === undefined) continue;
      // An empty string would render an empty link rather than no link.
      expect(project.live, project.name).not.toBe("");
      expect(new URL(project.live).protocol, project.name).toBe("https:");
    }
  });
});

describe("each record is complete enough to render", () => {
  const required = [
    "shortDescription",
    "description",
    "whyBuilt",
    "usage",
    "portfolioReason",
  ] as const;

  it.each(projects.map((p) => [p.name, p] as const))("%s", (_, project) => {
    for (const field of required) {
      expect(project[field].trim().length, field).toBeGreaterThan(20);
    }
    expect(project.technologies.length).toBeGreaterThan(0);
    expect(project.contribution.length).toBeGreaterThan(0);
    expect(project.engineeringHighlights.length).toBeGreaterThan(0);
    expect(typeof project.featured).toBe("boolean");

    for (const note of project.engineeringHighlights) {
      expect(note.title.trim()).toBeTruthy();
      expect(note.body.trim().length).toBeGreaterThan(20);
    }
  });
});

describe("values used as React keys are unique within a project", () => {
  it.each(projects.map((p) => [p.name, p] as const))("%s", (_, project) => {
    const technologies = project.technologies;
    expect(new Set(technologies).size, "technologies").toBe(
      technologies.length,
    );

    const titles = project.engineeringHighlights.map((note) => note.title);
    expect(new Set(titles).size, "engineering highlight titles").toBe(
      titles.length,
    );

    expect(new Set(project.contribution).size, "contribution").toBe(
      project.contribution.length,
    );
  });
});
