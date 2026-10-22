import { firePhase, type FirePhase } from "@/lib/fuel";
import { torchLight } from "@/lib/torch";

/**
 * The sound of the torch, made in the browser: no recordings, nothing to
 * download. Off until a reader turns it on (SoundToggle.tsx), and only ever
 * heard at night, while the torch is burning.
 *
 * A fire is three sounds at once:
 * - a low roar, the air the flame pulls in: brown noise, low-passed;
 * - a thin hiss, the gases burning: white noise, high-passed;
 * - crackles, resin and moisture bursting in the wood: very short clicks of
 *   band-passed noise at random moments, now and then a louder pop.
 *
 * Crackles are a Poisson process: the gap before the next one is drawn from
 * an exponential distribution, which is what makes them sound random rather
 * than ticking. They are scheduled a little ahead on the audio clock by a
 * coarse timer (the "two clocks" pattern), so they land exactly on time even
 * when the page is busy.
 *
 * The torch's life (lib/fuel.ts) is heard too: a dying torch sputters, going
 * out hisses, and catching again is a soft whoosh.
 */

export const SOUND_KEY = "cave-sound";

/** How loud each part of the fire is, and how often it crackles, for a phase and the flame's strength. */
export function soundOf(phase: FirePhase, strength: number) {
  const lit = phase === "out" ? 0 : Math.min(Math.max(strength, 0), 1);
  return {
    roar: 0.05 * lit,
    hiss: 0.006 * lit,
    /** Crackles a second: a steady fire a few, a dying one sputtering, a catching one many. */
    rate: phase === "out" ? 0 : phase === "dying" ? 6 * Math.max(lit, 0.25) : phase === "catching" ? 10 : 3.5,
    /** How loud a crackle is, at most. */
    crack: phase === "dying" ? 0.3 : 0.18,
  };
}

/** How far ahead crackles are scheduled, and how often the timer looks. */
const AHEAD = 0.15;
const TICK_MS = 50;

function noise(ctx: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    // Brown noise: each sample a small step from the last, so the energy
    // sits in the low frequencies, like a roar rather than a hiss.
    last = brown ? (last + 0.02 * white) / 1.02 : white;
    data[i] = brown ? last * 3.5 : white;
  }
  return buffer;
}

function createEngine() {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const white = noise(ctx, 2, false);

  const loop = (buffer: AudioBuffer, filter: BiquadFilterType, frequency: number) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const shape = ctx.createBiquadFilter();
    shape.type = filter;
    shape.frequency.value = frequency;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(shape).connect(gain).connect(master);
    source.start();
    return gain;
  };
  const roar = loop(noise(ctx, 4, true), "lowpass", 480);
  const hiss = loop(white, "highpass", 2600);

  /** A burst of noise through a filter, shaped by an envelope. */
  function burst(at: number, gain: number, length: number, filter: BiquadFilterType, from: number, to = from, q = 1) {
    const source = ctx.createBufferSource();
    source.buffer = white;
    const shape = ctx.createBiquadFilter();
    shape.type = filter;
    shape.Q.value = q;
    shape.frequency.setValueAtTime(from, at);
    shape.frequency.exponentialRampToValueAtTime(to, at + length);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(gain, at + Math.min(0.002, length / 4));
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + length);
    source.connect(shape).connect(envelope).connect(master);
    source.start(at, Math.random() * 1.5, length + 0.05);
  }

  let next = 0;
  function schedule() {
    const now = ctx.currentTime;
    const phase = firePhase.get();
    const level = soundOf(phase, torchLight.burning ? torchLight.strength : 0);
    roar.gain.setTargetAtTime(level.roar, now, 0.15);
    hiss.gain.setTargetAtTime(level.hiss, now, 0.15);
    if (next < now) next = now;
    while (level.rate > 0 && torchLight.burning && next < now + AHEAD) {
      const pop = Math.random() < 0.07 ? 2.2 : 1;
      burst(next, (0.25 + Math.random() * 0.75) * level.crack * pop, 0.004 + Math.random() * 0.02, "bandpass", 1200 + Math.random() * 3800, undefined, 0.8 + Math.random() * 2);
      next += -Math.log(1 - Math.random()) / level.rate;
    }
  }

  // Going out: a falling hiss. Catching: a whoosh as the flame takes.
  const onPhase = () => {
    if (!torchLight.burning) return;
    const at = ctx.currentTime + 0.02;
    const phase = firePhase.get();
    if (phase === "out") burst(at, 0.12, 1.6, "highpass", 4000, 1800, 0.7);
    if (phase === "catching") burst(at, 0.16, 0.7, "lowpass", 220, 3200, 0.9);
  };
  const unsubscribe = firePhase.subscribe(onPhase);

  let timer = 0;
  return {
    start() {
      void ctx.resume();
      master.gain.setTargetAtTime(1, ctx.currentTime, 0.2);
      if (!timer) timer = window.setInterval(schedule, TICK_MS);
    },
    stop() {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      window.clearInterval(timer);
      timer = 0;
      window.setTimeout(() => {
        if (!timer) void ctx.suspend();
      }, 600);
    },
    close() {
      unsubscribe();
      window.clearInterval(timer);
      void ctx.close();
    },
  };
}

let engine: ReturnType<typeof createEngine> | null = null;

/**
 * Turns the fire's sound on or off. The first time it is turned on must be
 * inside a click or a key press: browsers only let a page start making
 * sound in answer to the reader.
 */
export function fireSound(on: boolean) {
  if (on) {
    engine ??= createEngine();
    engine.start();
  } else {
    engine?.stop();
  }
}
