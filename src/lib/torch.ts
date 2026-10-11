/**
 * The cave and the flame.
 *
 * At night the page is a wall seen by torchlight. The theme's colours are the
 * wall as the flame shows it; everywhere else, darkness lies over ground and
 * writing alike. DARKNESS says how much: enough that the cave is dark and the
 * writing sinks into shadow, never so much that it is gone. Unlit, prose stays
 * at about 3.5:1; in the light it is back at the theme's full contrast. The
 * floors are in torch.test.ts.
 *
 * The flame is a small model of fire rather than an animation: a slow gust, a
 * fast, small flicker and now and then a draught that makes it dip. All of it
 * moves the light by a few percent, so the page never flashes.
 */

/** How much of the wall the dark hides, away from the light. */
export const DARKNESS = 0.55;

/** The dark itself: cold and nearly black, against the warm light. */
export const DARK_RGB = [5, 6, 10] as const;

/** When the flame dips, the whole cave dims a little with it. */
export function darknessFor(strength: number): number {
  return Math.min(0.72, DARKNESS + (1 - strength) * 0.18);
}

/** A colour as it looks in the dark: the darkness laid over it. */
export function inTheDark(hex: string, darkness: number = DARKNESS): string {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return (
    "#" +
    rgb
      .map((c, i) => Math.round(c * (1 - darkness) + DARK_RGB[i]! * darkness))
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** One instant of the flame, as small departures from a steady light. */
export type FlameState = {
  /** How far the light reaches, as a multiple of its usual reach. */
  reach: number;
  /** How bright it burns, as a multiple of full. */
  strength: number;
  /** Where the heart of the light has drifted, as a fraction of its reach. */
  dx: number;
  dy: number;
  /** Seconds since the flame was lit: drives each lobe's own slow wander. */
  time: number;
  /** Each tongue of the flame's own flicker, as a small departure from its size. */
  licks: readonly number[];
};

/** A flame that holds perfectly still, for readers who ask for less motion. */
export const STILL: FlameState = { reach: 1, strength: 1, dx: 0, dy: 0, time: 0, licks: [0, 0, 0, 0, 0] };

/** How many tongues the flame has (Torch draws one lobe of light for each). */
export const TONGUES = 5;

/**
 * A burning flame. `step(dt)` advances it by dt seconds and returns its state.
 * `random` is injectable so the behaviour can be tested deterministically.
 */
export function createFlame(random: () => number = Math.random) {
  // The slow gust: a few sines at unrelated frequencies, so it never loops
  // in a way the eye can catch.
  const phase = Array.from({ length: 6 }, () => random() * Math.PI * 2);
  let time = 0;
  // The fast flicker: a random walk pulled back towards zero. Each tongue of
  // the flame has its own, so its edge licks rather than pulsing as one.
  let flicker = 0;
  const licks = Array.from({ length: TONGUES }, () => 0);
  // A draught: now and then the flame leans and dips, then recovers. It
  // swells in over a fraction of a second rather than striking at once.
  let draught = 0;
  let gustOfAir = 0;
  let untilDraught = 3 + random() * 5;

  return {
    step(dt: number): FlameState {
      const step = Math.min(Math.max(dt, 0), 0.1);
      time += step;

      const gust =
        0.032 * Math.sin(time * 1.9 + phase[0]!) +
        0.021 * Math.sin(time * 3.3 + phase[1]!) +
        0.012 * Math.sin(time * 5.7 + phase[2]!);

      const pull = Math.exp(-step * 9);
      flicker = flicker * pull + (random() - 0.5) * 0.1 * Math.sqrt(step * 60);
      flicker = Math.max(-0.08, Math.min(0.08, flicker));
      const lickPull = Math.exp(-step * 7);
      for (let i = 0; i < TONGUES; i++) {
        const lick = licks[i]! * lickPull + (random() - 0.5) * 0.09 * Math.sqrt(step * 60);
        licks[i] = Math.max(-0.12, Math.min(0.12, lick));
      }

      untilDraught -= step;
      if (untilDraught <= 0) {
        gustOfAir = 0.09 + random() * 0.05;
        untilDraught = 3 + random() * 6;
      }
      gustOfAir *= Math.exp(-step * 4.5);
      draught += (gustOfAir - draught) * (1 - Math.exp(-step * 16));

      const reach = 1 + gust * 1.4 + flicker * 0.5 - draught * 0.6;
      const strength = 1 + flicker * 1.2 - draught * 1.3;
      return {
        reach: Math.max(0.84, Math.min(1.12, reach)),
        strength: Math.max(0.72, Math.min(1.04, strength)),
        dx: 0.035 * Math.sin(time * 1.3 + phase[3]!) + flicker * 0.4,
        dy: -0.03 * Math.abs(Math.sin(time * 1.7 + phase[4]!)) - draught * 0.25,
        time,
        licks: [...licks],
      };
    },
  };
}

/**
 * Where the light is, for the other parts of the cave that answer to it (the
 * rock, the paintings). Torch writes it every frame; nothing else does. In
 * viewport pixels, like the pointer.
 */
export const torchLight = {
  x: 0,
  y: 0,
  /** The light's usual reach, in pixels. */
  reach: 0,
  /** How brightly it burns, as FlameState.strength. */
  strength: 1,
  /** Whether the torch is burning at all. */
  burning: false,
};

/* -- Afterglow -------------------------------------------------------------

   Where the torch has just been stays faintly lit for a few seconds before
   the dark closes back in, so the lines just read are still there to glance
   back at. Marks are kept in page coordinates, so they stay on the writing
   they lit when the page scrolls. */

/** How long a place stays faintly lit after the torch leaves it. */
export const AFTERGLOW_SECONDS = 3.5;
/** At most, how much of the dark an afterglow lifts: well short of the light. */
export const AFTERGLOW_STRENGTH = 0.4;
const MAX_MARKS = 48;

export type GlowMark = { x: number; y: number; r: number; alpha: number };

export function createAfterglow() {
  let marks: { x: number; y: number; r: number; t: number }[] = [];

  return {
    /** The torch is at (x, y) on the page, with reach r, at time `now` in seconds. */
    leave(x: number, y: number, r: number, now: number) {
      const last = marks[marks.length - 1];
      // A torch held still refreshes the mark it is on rather than piling up new
      // ones, so the place keeps its glow from the moment the torch leaves it.
      if (last && Math.hypot(last.x - x, last.y - y) < r * 0.15) {
        last.t = now;
        return;
      }
      marks.push({ x, y, r, t: now });
      if (marks.length > MAX_MARKS) marks.shift();
    },
    /** What is still glowing at `now`, fading as it ages. */
    glowing(now: number): GlowMark[] {
      marks = marks.filter((m) => now - m.t < AFTERGLOW_SECONDS);
      return marks.map((m) => {
        const left = 1 - (now - m.t) / AFTERGLOW_SECONDS;
        return { x: m.x, y: m.y, r: m.r, alpha: AFTERGLOW_STRENGTH * left * left };
      });
    },
    clear() {
      marks = [];
    },
  };
}

/* -- Eyes adjusting --------------------------------------------------------

   The first time a reader steps into the cave it is darker than usual, and
   it eases to its ordinary dark over a few seconds, as eyes adjust. It
   happens once: the head script marks a reader who has never been in (see
   lib/theme.ts), and the torch records that they have. The torch is already
   on the title, so the name is never in the dark. */

export const EYES_KEY = "cave-eyes";
export const ADJUST_SECONDS = 4;
/** How dark the cave is in the first moment, before the eyes adjust. */
export const FIRST_DARKNESS = 0.7;

/** The extra darkness at `elapsed` seconds into the first visit. */
export function adjusting(elapsed: number): number {
  const t = Math.min(Math.max(elapsed / ADJUST_SECONDS, 0), 1);
  const eased = t * t * (3 - 2 * t);
  return (FIRST_DARKNESS - DARKNESS) * (1 - eased);
}

/* -- Embers ----------------------------------------------------------------

   Now and then a spark leaves the flame, rises, drifts and goes out. Rare on
   purpose: one every twelve to thirty-two seconds, never more than two in the
   air, each gone within about two seconds. */

export type Ember = { x: number; y: number; alpha: number; size: number };

export function createEmbers(random: () => number = Math.random) {
  type Spark = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    age: number;
    life: number;
    size: number;
    sway: number;
  };
  let sparks: Spark[] = [];
  let until = 6 + random() * 10;

  return {
    /** Advances dt seconds with the flame at (x, y); returns the sparks in the air. */
    step(dt: number, x: number, y: number): Ember[] {
      const step = Math.min(Math.max(dt, 0), 0.1);
      until -= step;
      if (until <= 0 && sparks.length < 2) {
        sparks.push({
          x: x + (random() - 0.5) * 14,
          y: y - 8,
          vx: (random() - 0.5) * 22,
          vy: -(46 + random() * 34),
          age: 0,
          life: 1.3 + random() * 0.8,
          size: 1.1 + random() * 0.9,
          sway: random() * Math.PI * 2,
        });
        until = 12 + random() * 20;
      }
      sparks = sparks.filter((s) => {
        s.age += step;
        s.vy *= Math.exp(-step * 0.6);
        s.x += (s.vx + Math.sin(s.age * 6 + s.sway) * 9) * step;
        s.y += s.vy * step;
        return s.age < s.life;
      });
      return sparks.map((s) => ({
        x: s.x,
        y: s.y,
        size: s.size,
        alpha: Math.min(1, s.age / 0.15) * Math.pow(1 - s.age / s.life, 1.5),
      }));
    },
  };
}
