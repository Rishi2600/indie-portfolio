import { describe, expect, it } from "vitest";
import { around, buildReadingOrder, placeOf, turnBetween } from "./reading-order";

const chapters = [
  { key: "now", numeral: "01", label: "Now", href: "/now" },
  { key: "work", numeral: "02", label: "Work", href: "/projects" },
  { key: "about", numeral: "03", label: "About", href: "/about" },
];
const projects = [
  { name: "A", href: "/projects/a" },
  { name: "B", href: "/projects/b" },
];
const order = buildReadingOrder(chapters, projects);

describe("buildReadingOrder", () => {
  it("starts at home, then reads each chapter with the work's projects after it", () => {
    expect(order.map((leaf) => leaf.href)).toEqual([
      "/",
      "/now",
      "/projects",
      "/projects/a",
      "/projects/b",
      "/about",
    ]);
  });

  it("numbers a project under its chapter", () => {
    expect(order.map((leaf) => leaf.numeral)).toEqual([
      undefined,
      "01",
      "02",
      "02.1",
      "02.2",
      "03",
    ]);
  });
});

describe("around", () => {
  it("finds the pages either side", () => {
    const { previous, next } = around(order, "/projects/b");
    expect(previous?.href).toBe("/projects/a");
    expect(next?.href).toBe("/about");
  });

  it("has nothing before the first page or after the last", () => {
    expect(around(order, "/").previous).toBeUndefined();
    expect(around(order, "/about").next).toBeUndefined();
  });

  it("treats a trailing slash as the same page", () => {
    expect(placeOf(order, "/now/")).toBe(1);
  });

  it("has nothing either side of a page that is not in the book", () => {
    expect(around(order, "/nowhere")).toEqual({ previous: undefined, next: undefined });
  });
});

describe("turnBetween", () => {
  it("turns forward deeper into the book and back towards the front", () => {
    expect(turnBetween(order, "/", "/about")).toBe("nav-forward");
    expect(turnBetween(order, "/projects/a", "/now")).toBe("nav-back");
  });

  it("does not turn for the same page or for a page outside the book", () => {
    expect(turnBetween(order, "/now", "/now")).toBeUndefined();
    expect(turnBetween(order, "/now", "/elsewhere")).toBeUndefined();
  });
});
