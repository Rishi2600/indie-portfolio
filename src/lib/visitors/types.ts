/**
 * The only thing the rest of the site knows about visit storage.
 *
 * Keeping this to two methods means the backing store can change — Redis
 * today, Postgres or a platform KV later — without anything above it moving.
 */
export interface VisitorCounter {
  /** Records one visit and returns the new total. */
  increment(): Promise<number>;
  /** Reads the total without recording anything. */
  getCount(): Promise<number>;
}

/**
 * Redis INCR answers with a number, GET with a string, and an unset key with
 * null. Anything else means the store is not what we think it is, and a
 * corrupt count is worse than no count.
 */
export function parseCount(value: unknown): number {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Visit count was not a finite number");
    }
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Visit count was not numeric: ${value.slice(0, 32)}`);
    }
    return parsed;
  }

  throw new Error(`Visit count had unexpected type: ${typeof value}`);
}
