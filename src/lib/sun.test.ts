import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { reliefTile } from "./rock";
import {
  castBy,
  combined,
  EVENING,
  MAX_SHADE,
  PAPER_SHADE,
  paperShading,
  shadowOffset,
  sunAt,
} from "./sun";

/** A moment in India: "2026-06-21", "06:30". */
const ist = (date: string, time: string) => new Date(`${date}T${time}:00+05:30`);

describe("the sun over India", () => {
  it("stands almost overhead at noon in midsummer", () => {
    expect(sunAt(ist("2026-06-21", "12:00")).elevation).toBeGreaterThan(85);
  });

  it("is lower at noon in midwinter", () => {
    const winter = sunAt(ist("2026-12-21", "12:00")).elevation;
    expect(winter).toBeGreaterThan(40);
    expect(winter).toBeLessThan(50);
  });

  it("rises in the east and sets in the west", () => {
    const morning = sunAt(ist("2026-10-15", "08:00")).azimuth;
    const evening = sunAt(ist("2026-10-15", "16:30")).azimuth;
    expect(morning).toBeGreaterThan(60);
    expect(morning).toBeLessThan(140);
    expect(evening).toBeGreaterThan(220);
    expect(evening).toBeLessThan(300);
  });

  it("keeps the low light of early evening through the night", () => {
    expect(sunAt(ist("2026-10-15", "23:30"))).toEqual(EVENING);
    expect(sunAt(ist("2026-10-15", "04:00"))).toEqual(EVENING);
  });

  it("works from any time zone the reader is in: it is India's sun", () => {
    const moment = ist("2026-10-15", "09:00");
    expect(sunAt(new Date(moment.toISOString()))).toEqual(sunAt(moment));
  });
});

describe("how its light falls", () => {
  it("throws longer shadows as the sun sinks", () => {
    const noon = castBy(sunAt(ist("2026-10-15", "12:00")));
    const late = castBy(sunAt(ist("2026-10-15", "16:45")));
    expect(late.stretch).toBeGreaterThan(noon.stretch);
    expect(late.softness).toBeGreaterThan(noon.softness);
  });

  it("casts shadows away from the sun: the morning's to the left, the evening's to the right", () => {
    const morning = shadowOffset(castBy(sunAt(ist("2026-10-15", "08:00"))), 60);
    const evening = shadowOffset(castBy(sunAt(ist("2026-10-15", "16:30"))), 60);
    expect(morning.x).toBeLessThan(0);
    expect(evening.x).toBeGreaterThan(0);
  });

  it("never stretches a shadow without limit", () => {
    expect(castBy({ elevation: 1, azimuth: 270 }).stretch).toBeLessThanOrEqual(2.6);
  });
});

describe("shade never costs the writing its contrast", () => {
  function luminance(hex: string, k = 1): number {
    const [r, g, b] = [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255) * k);
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
  }
  const css = readFileSync(join(__dirname, "..", "styles", "tokens.css"), "utf8");
  const day = css.slice(css.indexOf(":root {"), css.indexOf("\n}", css.indexOf(":root {")));
  const token = (name: string) => new RegExp(`${name}:\\s*(#[0-9a-f]{6});`).exec(day)![1]!;

  // Shade lies over writing and paper alike, as a real shadow does.
  const FLOORS: [string, number][] = [
    ["--ink", 7],
    ["--ink-soft", 7],
    ["--ink-faint", 4.5],
    ["--rubric", 4.5],
  ];

  it.each(FLOORS)("%s on paper in the deepest shade still clears %s:1", (fg, floor) => {
    const k = 1 - MAX_SHADE;
    const ratio = (luminance(token("--paper"), k) + 0.05) / (luminance(token(fg), k) + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(floor);
  });

  it("adds shades up as light does: each lets through what the last let through", () => {
    expect(combined(0.1, 0.1)).toBeCloseTo(0.19);
    expect(MAX_SHADE).toBeLessThan(0.13);
  });

  it("lights the paper's relief without ever shading past its share", () => {
    const tile = reliefTile("paper", 64, 11);
    const shading = paperShading(tile.data, sunAt(ist("2026-10-15", "16:30")));
    let shaded = 0;
    for (const a of shading) {
      expect(a).toBeLessThanOrEqual(Math.floor(PAPER_SHADE * 255));
      if (a > 0) shaded++;
    }
    // Some of the paper faces away from a low sun: the relief is visible.
    expect(shaded / shading.length).toBeGreaterThan(0.2);
  });
});
