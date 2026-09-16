import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PETALS = 8;
const PETAL = "M32 32 C27 24 27 15 32 10 C37 15 37 24 32 32 Z";
const ANGLES = Array.from({ length: PETALS }, (_, i) => (i * 360) / PETALS);

/**
 * The same rosette as the rest of the site, as a data URI. The renderer's SVG
 * support is partial, so the figure goes in as an image rather than as
 * elements it would have to interpret.
 */
function mark(): string {
  const petals = ANGLES.map(
    (angle) => `<path d="${PETAL}" transform="rotate(${angle} 32 32)"/>`,
  ).join("");

  const dots = ANGLES.map((angle) => {
    const radians = ((angle + 180 / PETALS) * Math.PI) / 180;
    const x = (32 + 24.5 * Math.cos(radians)).toFixed(2);
    const y = (32 + 24.5 * Math.sin(radians)).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="0.9" fill="#22201c"/>`;
  }).join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="360" height="360">` +
    `<g fill="none" stroke="#22201c" stroke-width="0.85" stroke-linejoin="round">` +
    `<circle cx="32" cy="32" r="27"/>${petals}<circle cx="32" cy="32" r="9"/></g>` +
    `${dots}<circle cx="32" cy="32" r="2.4" fill="#22201c"/></svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * The card is set in the site's own serif when it can be, and in the
 * renderer's default when it cannot.
 *
 * Google serves WOFF2 to anything it recognises as a modern browser, and the
 * image renderer cannot read WOFF2 — so this deliberately sends no User-Agent
 * at all, which is what gets a plain TrueType file back. `text` asks for a
 * subset covering only the glyphs the card actually sets, which turns a 380kB
 * download into a few kilobytes.
 *
 * Everything about this can fail: the network, the stylesheet's shape, the
 * format Google decides to serve. All of it degrades to the default font
 * rather than to a broken build, and the signature check at the end is what
 * makes that promise good — an unreadable file reaches the renderer as null,
 * not as bytes it will throw on.
 */
async function garamond(): Promise<ArrayBuffer | null> {
  try {
    const glyphs = `${site.name}${site.role}`;
    const stylesheet = await fetch(
      "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400&text=" +
        encodeURIComponent(glyphs),
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!stylesheet.ok) return null;

    // A subsetted font is served from /l/font?kit=… with no extension, so
    // the format() declaration — not the URL — is what says what it is.
    const url = /src:\s*url\((https:[^)]+)\)\s*format\(['"]truetype['"]\)/.exec(
      await stylesheet.text(),
    )?.[1];
    if (!url) return null;

    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return null;

    const data = await response.arrayBuffer();
    return isTrueType(data) ? data : null;
  } catch {
    return null;
  }
}

/**
 * The four bytes an sfnt file opens with. Anything else — an error page, a
 * WOFF2, a redirect body — is not something the renderer can parse, and it
 * says so by throwing partway through a build.
 */
function isTrueType(data: ArrayBuffer): boolean {
  if (data.byteLength < 4) return false;
  const tag = new DataView(data).getUint32(0);
  return (
    tag === 0x0001_0000 || // TrueType outlines
    tag === 0x4f54_544f || // "OTTO", CFF outlines
    tag === 0x7472_7565 // "true"
  );
}

export default async function Image() {
  const font = await garamond();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#f4f1e9",
          padding: "0 96px",
        }}
      >
        {/* The ruled margin, the same double line the page itself is ruled with. */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            bottom: 40,
            left: 40,
            border: "1px solid #c9bfa9",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 45,
            right: 45,
            bottom: 45,
            left: 45,
            border: "1px solid #ded5c1",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 148,
              color: "#22201c",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              width: 96,
              height: 2,
              backgroundColor: "#9c3a28",
              margin: "36px 0",
            }}
          />
          <div style={{ fontSize: 34, color: "#4c463c", maxWidth: 560 }}>
            {site.role}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={mark()}
            width={360}
            height={360}
            alt=""
            style={{ opacity: 0.14 }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "EB Garamond", data: font, weight: 400, style: "normal" }]
        : undefined,
    },
  );
}
