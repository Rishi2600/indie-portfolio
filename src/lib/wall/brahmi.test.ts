import { describe, expect, it } from "vitest";
import { toBrahmi } from "./brahmi";

const c = (...points: number[]) => String.fromCodePoint(...points);
const VIRAMA = 0x11046;

describe("English in Brahmi", () => {
  it("lets consonants carry their own a", () => {
    // ra, ma: "ram", as Hindi writes राम.
    expect(toBrahmi("ram")).toBe(c(0x1102d, 0x1102b));
  });

  it("puts any other vowel on the consonant as a sign", () => {
    // ka with the i sign, ta (retroflex) with the e sign.
    expect(toBrahmi("kite")).toBe(c(0x11013, 0x1103a, 0x1101d));
    expect(toBrahmi("me")).toBe(c(0x1102b, 0x11042));
  });

  it("writes a vowel with no consonant before it as a letter", () => {
    expect(toBrahmi("i")).toBe(c(0x11007));
    expect(toBrahmi("aa")).toBe(c(0x11006));
  });

  it("joins consonants with the virama", () => {
    // "stone": sa + virama + ṭa, o sign, na; the e is silent.
    expect(toBrahmi("stone")).toBe(c(0x11032, VIRAMA, 0x1101d, 0x11044, 0x11026));
  });

  it("hears a final y as a long ī", () => {
    expect(toBrahmi("history")).toBe(c(0x11033, 0x1103a, 0x11032, VIRAMA, 0x1101d, 0x11044, 0x1102d, 0x1103b));
  });

  it("hears English t and d as India does, and th as the dental", () => {
    expect(toBrahmi("t")).toBe(c(0x1101d));
    expect(toBrahmi("d")).toBe(c(0x1101f));
    expect(toBrahmi("tha")).toBe(c(0x11023));
  });

  it("softens c before e, i and y", () => {
    expect(toBrahmi("ca")).toBe(c(0x11013));
    expect(toBrahmi("ci")).toBe(c(0x11032, 0x1103a));
  });

  it("uses Brahmi's digits and ends a sentence with a danda", () => {
    expect(toBrahmi("2026.")).toBe(c(0x11068, 0x11066, 0x11068, 0x1106c, 0x11047));
  });

  it("keeps the spaces between words and drops what it cannot write", () => {
    expect(toBrahmi("hi, ram!")).toBe(`${c(0x11033, 0x1103a)} ${c(0x1102d, 0x1102b)}${c(0x11047)}`);
    expect(toBrahmi("@#$")).toBe("");
  });

  it("only ever writes Brahmi, spaces and nothing else", () => {
    const out = toBrahmi("Write your history, 2026! Quick brown fox; jumps over the lazy dog?");
    for (const ch of out) {
      const code = ch.codePointAt(0)!;
      expect(ch === " " || (code >= 0x11000 && code <= 0x1107f)).toBe(true);
    }
  });
});
