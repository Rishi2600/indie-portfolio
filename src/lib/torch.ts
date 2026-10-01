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
