/**
 * Daylight.
 *
 * By day the page is a leaf of an old book on a reading desk, lit by the sun
 * through a carved stone jaali. The light comes from the real sun over India
 * at the reader's moment: long and slanting in the morning and evening,
 * short at noon. Outside the hours of daylight the page keeps the low light
 * of early evening, so it never goes dark or strange.
 *
 * Sunlight never changes the paper's colour. Where the sun falls full on the
 * page it is exactly the theme's --paper; elsewhere it is the same paper in
 * shade, a little darker and never tinted. How much darker is capped
 * (MAX_SHADE) by the contrast the writing must keep, tested in sun.test.ts.
 */

/** Central India, on the meridian Indian Standard Time is kept by. */
const LATITUDE = 23;
const IST_OFFSET_HOURS = 5.5;

/** Below this the sun is too low to light a page through a window. */
const LOWEST = 8;
/** Early evening, held through the night. */
export const EVENING = { elevation: 14, azimuth: 262 } as const;

export type Sun = {
  /** Degrees above the horizon. */
  elevation: number;
  /** Degrees clockwise from north. */
  azimuth: number;
};

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Where the sun is over central India at `date`. */
export function sunAt(date: Date): Sun {
  const ist = new Date(date.getTime() + IST_OFFSET_HOURS * 3_600_000);
  const start = Date.UTC(ist.getUTCFullYear(), 0, 0);
  const day = Math.floor((ist.getTime() - start) / 86_400_000);
  const hours = ist.getUTCHours() + ist.getUTCMinutes() / 60 + ist.getUTCSeconds() / 3600;

  const declination = rad(23.44 * Math.sin(rad((360 / 365) * (284 + day))));
  const hourAngle = rad(15 * (hours - 12));
  const latitude = rad(LATITUDE);

  const elevation = Math.asin(
    Math.sin(latitude) * Math.sin(declination) +
      Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle),
  );
  const azimuth = Math.atan2(
    -Math.sin(hourAngle),
    Math.tan(declination) * Math.cos(latitude) - Math.sin(latitude) * Math.cos(hourAngle),
  );
  const sun = { elevation: deg(elevation), azimuth: (deg(azimuth) + 360) % 360 };
  return sun.elevation < LOWEST ? { ...EVENING } : sun;
}

/**
 * How the sun's light falls on the page, laid flat on a desk with north at
 * the top of the screen and east to the right.
 */
export type Cast = {
  /** A unit vector on the screen pointing towards the sun. */
  toward: { x: number; y: number };
  /** How far shadows stretch away from the sun: 1 at noon overhead, longer as it sinks. */
  stretch: number;
  /** How soft a shadow's edge is, in pixels: softer the lower the sun. */
  softness: number;
};

export function castBy(sun: Sun): Cast {
  const a = rad(sun.azimuth);
  const e = rad(Math.max(sun.elevation, LOWEST));
  return {
    toward: { x: Math.sin(a), y: -Math.cos(a) },
    stretch: Math.min(1 / Math.sin(e), 2.6),
    softness: 3 + 6 * (1 - Math.sin(e)),
  };
}

/** How far a thing `height` px above the page throws its shadow, as an offset on screen. */
export function shadowOffset(cast: Cast, height: number): { x: number; y: number } {
  const length = Math.min(height * Math.sqrt(cast.stretch * cast.stretch - 1), height * 2.4);
  return { x: -cast.toward.x * length, y: -cast.toward.y * length };
}

/* -- How much shade -------------------------------------------------------

   Shade is drawn as darkness laid over the page, writing and all, the way a
   shadow falls on a real page. The three kinds never add up past MAX_SHADE. */

/** The jaali's bars, where they stand between the sun and the page. */
export const BAR_SHADE = 0.07;
/** The page outside the patch of sun the window throws. */
export const ROOM_SHADE = 0.03;
/** The paper's own waves and fibres, on their sides turned from the sun. */
export const PAPER_SHADE = 0.025;
/** A bird passing between the sun and the page. */
export const BIRD_SHADE = 0.045;

/** Darkness laid over darkness: what is left is what each lets through. */
export function combined(...shades: number[]): number {
  return 1 - shades.reduce((left, s) => left * (1 - s), 1);
}

/** The most the page can ever be shaded, anywhere. */
export const MAX_SHADE = combined(Math.max(BAR_SHADE, ROOM_SHADE), PAPER_SHADE, BIRD_SHADE);

/**
 * The paper's own relief, lit by the sun: how much shade each texel of a
 * relief tile (lib/rock.ts) takes, as alpha 0..255. Faces turned to the sun
 * take none; faces turned away take up to PAPER_SHADE.
 */
export function paperShading(normals: Uint8Array, sun: Sun): Uint8ClampedArray {
  const a = rad(sun.azimuth);
  const e = rad(Math.max(sun.elevation, LOWEST));
  const lx = Math.sin(a) * Math.cos(e);
  const ly = -Math.cos(a) * Math.cos(e);
  const lz = Math.sin(e);
  const out = new Uint8ClampedArray(normals.length / 4);
  for (let k = 0; k < out.length; k++) {
    const nx = normals[k * 4]! / 127.5 - 1;
    const ny = normals[k * 4 + 1]! / 127.5 - 1;
    const nz = normals[k * 4 + 2]! / 127.5 - 1;
    // How much less this face sees the sun than flat paper would.
    const facing = (nx * lx + ny * ly + nz * lz) / lz;
    const turned = Math.min(Math.max(1 - facing, 0), 1);
    out[k] = Math.round(turned * PAPER_SHADE * 255 * 4);
  }
  // No texel may shade past PAPER_SHADE.
  const cap = Math.floor(PAPER_SHADE * 255);
  for (let k = 0; k < out.length; k++) out[k] = Math.min(out[k]!, cap);
  return out;
}
