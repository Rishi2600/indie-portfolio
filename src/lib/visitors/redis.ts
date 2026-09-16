import { parseCount, type VisitorCounter } from "./types";

/** A slow store must not hold a request open. */
const TIMEOUT_MS = 2500;

type RedisReply = {
  result?: unknown;
  error?: string;
};

/**
 * A counter on any Redis-compatible HTTP endpoint — Upstash is the one this
 * was written against.
 *
 * INCR is atomic on the server, which is the entire reason for choosing Redis
 * here: two visits landing in the same millisecond on two different instances
 * still produce two increments. Nothing is read-modify-written in this
 * process, so there is no race to lose.
 *
 * It speaks the REST protocol directly rather than through a client library.
 * Two commands do not justify a dependency.
 */
export function createRedisCounter(
  baseUrl: string,
  token: string,
  key: string,
): VisitorCounter {
  const origin = baseUrl.replace(/\/+$/, "");
  const encodedKey = encodeURIComponent(key);

  async function command(path: string): Promise<unknown> {
    const response = await fetch(`${origin}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Visit store responded ${response.status}`);
    }

    const body: unknown = await response.json();

    if (typeof body !== "object" || body === null) {
      throw new Error("Visit store returned a malformed response");
    }

    const reply = body as RedisReply;
    if (reply.error) throw new Error(`Visit store error: ${reply.error}`);

    return reply.result;
  }

  return {
    async increment() {
      return parseCount(await command(`incr/${encodedKey}`));
    },
    async getCount() {
      return parseCount(await command(`get/${encodedKey}`));
    },
  };
}
