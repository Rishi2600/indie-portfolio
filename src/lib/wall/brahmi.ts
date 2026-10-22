/**
 * English, written in Brahmi.
 *
 * Brahmi is the script of Ashoka's edicts, cut into rock and pillars across
 * India in the third century BCE, and the ancestor of nearly every script
 * written in South and South-East Asia today, Devanagari among them. Writing
 * on the cave wall goes up in it.
 *
 * This is not a translation, and not a scholarly transliteration: it is how
 * an English sentence would be spelt by someone writing it by ear in Brahmi.
 * English spelling is not phonetic, so it is a game of rules of thumb, the
 * same ones used every day to write English names in Devanagari:
 *
 * - t and d are the retroflex ṭa and ḍa, as English t and d are heard in
 *   India ("Tom" is टॉम); th is the dental tha, dh dha.
 * - Consonants carry an inherent a; any other vowel after one is a vowel
 *   sign on it. A vowel with no consonant before it is a letter of its own.
 * - Two consonants together join with the virama, which the font draws as a
 *   conjunct where it has one.
 * - A final e after a consonant is silent, as in "stone"; a final y after one
 *   is a long ī, as in "history".
 * - f is pha, z is ja, q is ka, c is sa before e, i and y and ka elsewhere,
 *   x is ka joined to sa, w is va.
 * - Digits are Brahmi's own, and a full stop is a danda.
 *
 * Unicode has had a Brahmi block since 6.0 (2010): U+11000 to U+1107F.
 */

const cp = (n: number) => String.fromCodePoint(n);

const VIRAMA = cp(0x11046);
const DANDA = cp(0x11047);

/** Consonants, longest spelling first so "sh" wins over "s". */
const CONSONANTS: [string, string][] = [
  ["chh", cp(0x11019)],
  ["kh", cp(0x11014)],
  ["gh", cp(0x11016)],
  ["ch", cp(0x11018)],
  ["jh", cp(0x1101b)],
  ["th", cp(0x11023)],
  ["dh", cp(0x11025)],
  ["ph", cp(0x11028)],
  ["bh", cp(0x1102a)],
  ["sh", cp(0x11030)],
  ["ng", cp(0x11017)],
  ["k", cp(0x11013)],
  ["g", cp(0x11015)],
  ["j", cp(0x1101a)],
  ["t", cp(0x1101d)],
  ["d", cp(0x1101f)],
  ["n", cp(0x11026)],
  ["p", cp(0x11027)],
  ["f", cp(0x11028)],
  ["b", cp(0x11029)],
  ["m", cp(0x1102b)],
  ["y", cp(0x1102c)],
  ["r", cp(0x1102d)],
  ["l", cp(0x1102e)],
  ["v", cp(0x1102f)],
  ["w", cp(0x1102f)],
  ["s", cp(0x11032)],
  ["h", cp(0x11033)],
  ["z", cp(0x1101a)],
  ["q", cp(0x11013)],
];

/** Vowels: the letter on its own, and the sign on a consonant ("" is the inherent a). */
const VOWELS: [string, string, string][] = [
  ["aa", cp(0x11006), cp(0x11038)],
  ["ai", cp(0x11010), cp(0x11043)],
  ["au", cp(0x11012), cp(0x11045)],
  ["ee", cp(0x11008), cp(0x1103b)],
  ["ii", cp(0x11008), cp(0x1103b)],
  ["oo", cp(0x1100a), cp(0x1103d)],
  ["uu", cp(0x1100a), cp(0x1103d)],
  ["a", cp(0x11005), ""],
  ["e", cp(0x1100f), cp(0x11042)],
  ["i", cp(0x11007), cp(0x1103a)],
  ["o", cp(0x11011), cp(0x11044)],
  ["u", cp(0x11009), cp(0x1103c)],
];

const KA = cp(0x11013);
const SA = cp(0x11032);
const LONG_I_SIGN = cp(0x1103b);

type Unit = { kind: "consonant"; glyph: string } | { kind: "vowel"; letter: string; sign: string } | { kind: "other"; glyph: string };

function tokenize(word: string): Unit[] {
  const units: Unit[] = [];
  let i = 0;
  while (i < word.length) {
    const rest = word.slice(i);
    const ch = rest[0]!;
    if (/[0-9]/.test(ch)) {
      units.push({ kind: "other", glyph: cp(0x11066 + Number(ch)) });
      i++;
      continue;
    }
    if (ch === "c") {
      const soft = /^[eiy]/.test(rest.slice(1)) && !rest.startsWith("ch");
      if (!rest.startsWith("ch")) {
        units.push({ kind: "consonant", glyph: soft ? SA : KA });
        i++;
        continue;
      }
    }
    if (ch === "x") {
      units.push({ kind: "consonant", glyph: KA }, { kind: "consonant", glyph: SA });
      i++;
      continue;
    }
    // A y at the end of a word, after a consonant, is a vowel: "history".
    if (ch === "y" && rest.length === 1 && units.at(-1)?.kind === "consonant") {
      units.push({ kind: "vowel", letter: cp(0x11008), sign: LONG_I_SIGN });
      i++;
      continue;
    }
    const consonant = CONSONANTS.find(([spelling]) => rest.startsWith(spelling));
    if (consonant) {
      units.push({ kind: "consonant", glyph: consonant[1] });
      i += consonant[0].length;
      continue;
    }
    const vowel = VOWELS.find(([spelling]) => rest.startsWith(spelling));
    if (vowel) {
      units.push({ kind: "vowel", letter: vowel[1], sign: vowel[2] });
      i += vowel[0].length;
      continue;
    }
    i++;
  }
  return units;
}

function word(spelling: string): string {
  let units = tokenize(spelling);
  // The silent e of "stone" and "write".
  const last = units.at(-1);
  if (spelling.length > 3 && spelling.endsWith("e") && last?.kind === "vowel" && units.at(-2)?.kind === "consonant") {
    units = units.slice(0, -1);
  }
  let out = "";
  units.forEach((unit, i) => {
    const before = units[i - 1];
    const after = units[i + 1];
    if (unit.kind === "other") out += unit.glyph;
    else if (unit.kind === "vowel") out += before?.kind === "consonant" ? unit.sign : unit.letter;
    else {
      out += unit.glyph;
      // Joined to the consonant that follows it; at the end of a word it
      // keeps its a unwritten and unsaid, as Hindi does ("ram" is राम).
      if (after?.kind === "consonant") out += VIRAMA;
    }
  });
  return out;
}

/** An English line, spelt in Brahmi. */
export function toBrahmi(text: string): string {
  return text
    .toLowerCase()
    .split(/(\s+|[.!?]+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return " ";
      if (/^[.!?]+$/.test(part)) return DANDA;
      return word(part.replace(/[^a-z0-9]/g, ""));
    })
    .join("")
    .replace(/ +/g, " ")
    .trim();
}
