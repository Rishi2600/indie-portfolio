import { describe, expect, it } from "vitest";
import { featuredProjects, projectPath } from "./projects";
import { sectionIndex } from "./site";
import { stack, stackNames } from "./skills";
import {
  buildTechIndex,
  otherPlaces,
  SKILLS_PLACE,
  technologyKey,
} from "./technologies";

const options = {
  numerals: { work: "02", stack: "03" },
  projectHref: (slug: string) => `/projects/${slug}`,
  stackHref: "/stack",
};

describe("technologyKey", () => {
  it("ignores case and surrounding space", () => {
    expect(technologyKey("  PostgreSQL ")).toBe("postgresql");
    expect(technologyKey("Next.js")).toBe(technologyKey("next.js"));
  });

  it("joins the spellings that were written differently for one thing", () => {
    expect(technologyKey("Next.js 14")).toBe(technologyKey("Next.js"));
    expect(technologyKey("Tailwind CSS v4")).toBe(technologyKey("Tailwind CSS"));
    expect(technologyKey("Solana development")).toBe(technologyKey("Solana"));
  });

  it("leaves everything else alone, so two things are never merged by accident", () => {
    expect(technologyKey("Mongoose")).not.toBe(technologyKey("MongoDB"));
    expect(technologyKey("Go")).toBe("go");
  });
});

describe("buildTechIndex", () => {
  const projects = [
    { slug: "a", name: "A", technologies: ["Rust", "Next.js 14"] },
    { slug: "b", name: "B", technologies: ["next.js", "Go"] },
  ];
  const groups = ["Next.js", "Rust", "Next.js"];
  const index = buildTechIndex(projects, groups, options);

  it("lists every place a technology appears, projects first and in order", () => {
    expect(index["next.js"]?.map((place) => place.id)).toEqual([
      "a",
      "b",
      SKILLS_PLACE,
    ]);
    expect(index["rust"]?.map((place) => place.id)).toEqual(["a", SKILLS_PLACE]);
  });

  it("cites a project by its position in the work and the stack by its chapter", () => {
    expect(index["next.js"]?.map((place) => place.label)).toEqual([
      "02.1",
      "02.2",
      "03",
    ]);
  });

  it("points each place at its page", () => {
    expect(index["next.js"]?.map((place) => place.href)).toEqual([
      "/projects/a",
      "/projects/b",
      "/stack",
    ]);
  });

  it("counts the stack once, however many times it names something", () => {
    const skills = index["next.js"]?.filter((p) => p.id === SKILLS_PLACE);
    expect(skills).toHaveLength(1);
  });

  it("leaves out a technology that appears in only one place", () => {
    expect(index).not.toHaveProperty("go");
  });

  it("does not count a project twice for spelling a name twice", () => {
    const once = buildTechIndex(
      [{ slug: "a", name: "A", technologies: ["Rust", "rust"] }],
      [],
      options,
    );
    expect(once).toEqual({});
  });
});

describe("otherPlaces", () => {
  const index = buildTechIndex(
    [
      { slug: "a", name: "A", technologies: ["Rust"] },
      { slug: "b", name: "B", technologies: ["Rust"] },
    ],
    ["Rust"],
    options,
  );

  it("leaves out the place the reader is already looking at", () => {
    expect(otherPlaces(index, "rust", "a").map((p) => p.id)).toEqual([
      "b",
      SKILLS_PLACE,
    ]);
    expect(otherPlaces(index, "rust", SKILLS_PLACE).map((p) => p.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("returns everything when the starting place is unknown", () => {
    expect(otherPlaces(index, "rust", undefined)).toHaveLength(3);
  });

  it("finds nothing for a key that has no entry, including inherited ones", () => {
    expect(otherPlaces(index, "go", "a")).toEqual([]);
    expect(otherPlaces(index, "constructor", "a")).toEqual([]);
    expect(otherPlaces(index, "__proto__", "a")).toEqual([]);
  });
});

describe("the real records", () => {
  const index = buildTechIndex(featuredProjects, stackNames(stack), {
    numerals: { work: sectionIndex.work, stack: sectionIndex.stack },
    projectHref: projectPath,
    stackHref: "/stack",
  });

  it("finds something to cross-reference", () => {
    expect(Object.keys(index).length).toBeGreaterThan(0);
  });

  it("never lists a technology in fewer than two distinct places", () => {
    for (const [key, places] of Object.entries(index)) {
      expect(new Set(places.map((p) => p.id)).size, key).toBeGreaterThanOrEqual(2);
    }
  });

  it("gives every place a label, a title and a link to a page of the site", () => {
    for (const places of Object.values(index)) {
      for (const place of places) {
        expect(place.label).toMatch(/^\d{2}(\.\d+)?$/);
        expect(place.title.trim()).toBeTruthy();
        expect(place.href).toMatch(/^\/[\w/-]+$/);
      }
    }
  });

  it("does not spell a technology two ways without joining them", () => {
    // "Next.js" beside "Next.js 14", or "Solana" beside "Solana development",
    // is a spelling that belongs in SAME_AS and has been missed.
    const names = [
      ...featuredProjects.flatMap((p) => p.technologies),
      ...stackNames(stack),
    ];
    const keys = [...new Set(names.map(technologyKey))];
    for (const short of keys) {
      for (const long of keys) {
        expect(long.startsWith(`${short} `), `${short} / ${long}`).toBe(false);
      }
    }
  });
});
