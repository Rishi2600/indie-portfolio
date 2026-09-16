import { createHash, randomBytes } from "node:crypto";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
/** Above this many tracked callers, sweep the expired ones out. */
const SWEEP_THRESHOLD = 1024;

const windows = new Map<string, { count: number; expiresAt: number }>();

/**
 * Regenerated every time the process starts and never written anywhere.
 *
 * It is what makes the fingerprint below one-way in practice as well as in
 * theory: an IP address has so little entropy that a bare SHA-256 of one can
 * be brute-forced in seconds. Salting with a secret the process forgets on
 * restart means the digests cannot be reversed, cannot be matched against a
 * list of addresses, and cannot be correlated across deploys.
 */
const SALT = randomBytes(32);

/**
 * A short-lived, unreversible handle for the caller.
 *
 * The address itself is never stored, logged, or returned — it exists inside
 * this function and nowhere else. The site does not want to know who is
 * visiting; it wants to know that one caller is not sending a thousand
 * requests a minute.
 */
export function fingerprint(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const address =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return createHash("sha256")
    .update(SALT)
    .update(address)
    .digest("base64url")
    .slice(0, 22);
}

/**
 * A fixed window, held in this process's memory.
 *
 * Serverless instances do not share memory, so a determined caller spread
 * across instances gets a larger allowance than the constant suggests. That
 * is acceptable: this is a guard against a runaway loop and casual abuse, and
 * the visit cookie — not this — is what stops a normal reader being counted
 * twice. Nothing here is a security boundary.
 */
export function allow(key: string): boolean {
  const now = Date.now();

  if (windows.size > SWEEP_THRESHOLD) {
    for (const [existing, window] of windows) {
      if (window.expiresAt <= now) windows.delete(existing);
    }
  }

  const window = windows.get(key);

  if (!window || window.expiresAt <= now) {
    windows.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    return true;
  }

  window.count += 1;
  return window.count <= MAX_REQUESTS;
}
