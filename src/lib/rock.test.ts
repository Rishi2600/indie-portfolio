import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AMBIENT, BRIGHTEST, reliefTile, wallLight } from "./rock";

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
}
const scaled = (hex: string, k: number) =>
  "#" +
  [1, 3, 5]
    .map((i) => Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k)))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("");

const css = readFileSync(join(__dirname, "..", "styles", "tokens.css"), "utf8");
const night = css.slice(css.indexOf(':root[data-theme="night"] {'));
const token = (name: string) => new RegExp(`${name}:\\s*(#[0-9a-f]{6});`).exec(night)![1]!;

describe("the relief", () => {
  const tiles = [reliefTile("forms", 128, 7), reliefTile("grain", 64, 3), reliefTile("paper", 64, 11)];

  it.each(tiles)("tiles without a seam (size $size)", ({ size, data }) => {
    // The height across the tile's edge changes no more than it does between
    // ordinary neighbours inside it.
    const h = (i: number, j: number) => data[(j * size + i) * 4 + 3]!;
    let inside = 0;
    let across = 0;
    for (let j = 0; j < size; j++) {
      inside = Math.max(inside, Math.abs(h(1, j) - h(0, j)), Math.abs(h(size - 1, j) - h(size - 2, j)));
      across = Math.max(across, Math.abs(h(0, j) - h(size - 1, j)));
    }
    expect(across).toBeLessThanOrEqual(inside * 1.5 + 2);
  });

  it.each(tiles)("always faces out of the wall (size $size)", ({ size, data }) => {
    for (let k = 0; k < size * size; k++) {
      const x = data[k * 4]! / 127.5 - 1;
      const y = data[k * 4 + 1]! / 127.5 - 1;
      const z = data[k * 4 + 2]! / 127.5 - 1;
      expect(z).toBeGreaterThan(0);
      expect(Math.hypot(x, y, z)).toBeGreaterThan(0.95);
      expect(Math.hypot(x, y, z)).toBeLessThan(1.05);
    }
  });

  it("has real relief: the rock is not flat", () => {
    const { size, data } = tiles[0]!;
    let tilted = 0;
    for (let k = 0; k < size * size; k++) if (data[k * 4 + 2]! < 240) tilted++;
    expect(tilted / (size * size)).toBeGreaterThan(0.2);
  });

  it("is the same rock on every visit", () => {
    expect(reliefTile("forms", 32, 7).data).toEqual(reliefTile("forms", 32, 7).data);
  });
});

describe("the light on the wall", () => {
  it("shows the theme's own stone where a flat wall is right under the flame", () => {
    expect(wallLight(1, 1, 0, 300, 1)).toBeCloseTo(1);
  });

  it("brightens faces turned to the flame and darkens faces turned away", () => {
    expect(wallLight(1.4, 1, 200, 300, 1)).toBeGreaterThan(wallLight(1, 1, 200, 300, 1));
    expect(wallLight(0.6, 1, 200, 300, 1)).toBeLessThan(wallLight(1, 1, 200, 300, 1));
  });

  it("puts a point in a ridge's shadow darker than the same point in the open", () => {
    expect(wallLight(1, 1, 200, 300, 1, 0.3)).toBeLessThan(wallLight(1, 1, 200, 300, 1));
    expect(wallLight(1, 1, 200, 300, 1, 0)).toBeGreaterThanOrEqual(AMBIENT * 0.88);
  });

  it("falls away into the dark far from the torch", () => {
    expect(wallLight(1, 1, 3000, 300, 1)).toBeLessThan(AMBIENT + 0.02);
  });

  it("can never lift the stone enough to hurt reading: prose stays at 7:1 or better", () => {
    const ink = token("--ink");
    const brightest = scaled(token("--paper"), BRIGHTEST);
    const ratio = (luminance(ink) + 0.05) / (luminance(brightest) + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });
});
