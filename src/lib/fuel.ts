/**
 * The torch's fuel.
 *
 * A torch is a stick wrapped in something that burns, and it burns down. This
 * is the life of one: lit, burning for a few minutes, guttering for about
 * twenty seconds, out, and caught again from the embers in the corner.
 *
 * While it burns, nothing here touches the flame: lib/torch.ts draws it
 * exactly as it always has, and Fire is LIT, every multiplier exactly one.
 * Only the guttering, the dark and the catching are new.
 *
 * Out is dark, never blind. The cave goes to OUT_DARKNESS, which still keeps
 * unlit prose at 3:1 (fuel.test.ts), the same floor the cave holds away from
 * the light.
 */

export type FirePhase = "burning" | "dying" | "out" | "catching";

/** How long a fresh torch burns before it starts to gutter, in seconds. */
export const BURN_MIN = 180;
export const BURN_MAX = 300;
/** How long it gutters before it goes out: warning enough to finish a line. */
export const DYING_SECONDS = 20;
/** How long its head glows like a coal once it is out. */
export const COAL_SECONDS = 5;
/** How long it takes to catch from the embers and settle. */
export const CATCH_SECONDS = 1.6;

/** How dark the cave is with no flame at all: the most that keeps prose at 3:1. */
export const OUT_DARKNESS = 0.59;
/** The darkest a burning torch ever lets the cave get, in a draught (darknessFor). */
const DRAUGHT_DARKNESS = 0.72;

/** The torch's state, as multipliers on the flame lib/torch.ts draws. */
export type Fire = {
  phase: FirePhase;
  /** Multiplies the flame's reach. */
  reach: number;
  /** Multiplies the flame's strength. */
  strength: number;
  /** How far its colour has cooled from amber towards a deep red, 0 to 1. */
  cool: number;
  /** The glow of the head of a torch that has just gone out, 0 to 1. */
  coal: number;
  /** How much smoke it gives off, 0 to 1. */
  smoke: number;
  /**
   * The most darkness the cave may have. A burning torch's draughts dim the
   * cave for a moment, deeper than OUT_DARKNESS; a dying or dead one may not
   * hold it there, so this eases down to OUT_DARKNESS rather than jumping.
   */
  cap: number;
};

/** A torch burning as it always has: every multiplier exactly one. */
export const LIT: Fire = {
  phase: "burning",
  reach: 1,
  strength: 1,
  cool: 0,
  coal: 0,
  smoke: 0,
  cap: DRAUGHT_DARKNESS,
};

/** What survives a reload: enough to carry on where the torch was. */
export type FuelSnapshot = { phase: FirePhase; left: number };

const smoothstep = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
};

/** Out past its target and back, once, as a flame does when it catches. */
function overshoot(t: number) {
  const c1 = 1.4;
  const c3 = c1 + 1;
  const x = Math.min(Math.max(t, 0), 1) - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
}

/**
 * A torch. `step(dt)` advances it by dt seconds and returns its state;
 * `relight()` catches it from the embers. `random` is injectable so the
 * behaviour can be tested deterministically.
 */
export function createFuel(random: () => number = Math.random, saved?: FuelSnapshot) {
  const fresh = () => BURN_MIN + random() * (BURN_MAX - BURN_MIN);

  let phase: FirePhase = "burning";
  /** Seconds of burning left, or seconds into the current phase. */
  let left = fresh();
  let elapsed = 0;
  if (saved?.phase === "burning" && saved.left > 0) left = Math.min(saved.left, BURN_MAX);
  if (saved?.phase === "dying") {
    phase = "dying";
    elapsed = Math.min(Math.max(DYING_SECONDS - saved.left, 0), DYING_SECONDS);
  }
  if (saved?.phase === "out") {
    phase = "out";
    // Already cold: the coal went out before the reload.
    elapsed = COAL_SECONDS * 3;
  }

  // Guttering: now and then the flame chokes on what is left and sinks, then
  // recovers, more often and more deeply as it burns down. Each choke swells
  // in and eases out, so nothing jumps from one frame to the next.
  let choke = 0;
  let choking = 0;
  let untilChoke = 0.8;
  // Where it was when it was caught again, so the catch starts from there.
  let from = { reach: 0, strength: 0 };
  let current: Fire =
    phase === "burning" ? LIT : { ...LIT, phase, reach: 0, strength: 0, cap: OUT_DARKNESS };

  function dying(dt: number): Fire {
    const t = elapsed / DYING_SECONDS;
    untilChoke -= dt;
    if (untilChoke <= 0) {
      choking = (0.08 + random() * 0.14) * (0.4 + t);
      untilChoke = (0.5 + random() * 2) * (1.2 - t * 0.7);
    }
    choking *= Math.exp(-dt * 3.5);
    choke += (choking - choke) * (1 - Math.exp(-dt * 10));

    // One last breath before the end, and then it goes.
    const gasp = 0.14 * Math.exp(-(((t - 0.86) / 0.03) ** 2));
    const end = 1 - smoothstep((t - 0.9) / 0.1);
    const reach = (1 - 0.62 * t ** 1.4 - choke * 0.6 + gasp) * end;
    const strength = (1 - 0.58 * t ** 1.2 - choke + gasp) * end;
    return {
      phase,
      reach: Math.max(0, reach),
      strength: Math.max(0, strength),
      cool: smoothstep(t * 1.3),
      coal: smoothstep((t - 0.85) / 0.15),
      smoke: 0.25 + 0.6 * t,
      cap: DRAUGHT_DARKNESS - (DRAUGHT_DARKNESS - OUT_DARKNESS) * smoothstep(elapsed / 2),
    };
  }

  return {
    step(dt: number): Fire {
      const step = Math.min(Math.max(dt, 0), 0.1);
      if (phase === "burning") {
        left -= step;
        if (left > 0) return (current = LIT);
        phase = "dying";
        elapsed = 0;
      }
      elapsed += step;
      if (phase === "dying") {
        if (elapsed < DYING_SECONDS) return (current = dying(step));
        phase = "out";
        elapsed = 0;
      }
      if (phase === "out") {
        const coal = Math.exp(-elapsed / (COAL_SECONDS / 3)) * (1 - smoothstep(elapsed / COAL_SECONDS));
        return (current = { phase, reach: 0, strength: 0, cool: 1, coal, smoke: coal, cap: OUT_DARKNESS });
      }
      // Catching: from a small flame, out past full, and back to it.
      const t = elapsed / CATCH_SECONDS;
      if (t >= 1) {
        phase = "burning";
        left = fresh();
        return (current = LIT);
      }
      const rise = overshoot(t);
      return (current = {
        phase,
        reach: from.reach + (1 - from.reach) * rise,
        strength: from.strength + (1 - from.strength) * rise,
        cool: 0.6 * (1 - smoothstep(t)),
        coal: 0,
        smoke: 0.4 * (1 - t),
        cap: OUT_DARKNESS + (DRAUGHT_DARKNESS - OUT_DARKNESS) * smoothstep(t),
      });
    },

    /** Caught from the embers. Only a torch that is going or gone can be. */
    relight() {
      if (phase !== "dying" && phase !== "out") return;
      // From wherever the flame is, even nothing: starting it any brighter
      // would brighten the whole cave in one frame.
      from = { reach: current.reach, strength: current.strength };
      phase = "catching";
      elapsed = 0;
    },

    get phase() {
      return phase;
    },

    snapshot(): FuelSnapshot {
      if (phase === "burning") return { phase, left };
      if (phase === "dying") return { phase, left: DYING_SECONDS - elapsed };
      if (phase === "out") return { phase, left: 0 };
      // A torch caught mid-reload is simply burning.
      return { phase: "burning", left: fresh() };
    },
  };
}

/**
 * How dark the cave is, given the darkness the flame alone would leave
 * (darknessFor). While it burns, that is exactly what it always was.
 */
export function darknessOf(darkness: number, fire: Fire): number {
  return Math.min(darkness, fire.cap);
}
