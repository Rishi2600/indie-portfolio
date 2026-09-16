import { join } from "node:path";
import { createFileCounter } from "./file";
import { createRedisCounter } from "./redis";
import type { VisitorCounter } from "./types";

type Env = Readonly<Record<string, string | undefined>>;

const DEFAULT_KEY = "portfolio:visits";

export type Backend =
  | { kind: "redis"; url: string; token: string; key: string }
  | { kind: "file"; path: string; warning?: string }
  | { kind: "unavailable"; reason: string };

/** Blank is absent: a variable saved empty in a dashboard is not configured. */
function read(env: Env, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

/**
 * Which store the counter uses, as a pure function of the environment.
 *
 * - Redis whenever both halves of a credential are present. Upstash's own
 *   names are read first; the KV_REST_API_* pair is what Vercel's
 *   Marketplace integration injects.
 * - On Vercel without Redis, nothing. A function's filesystem is read-only
 *   apart from /tmp, and /tmp is neither shared between instances nor kept
 *   between invocations, so a file there would be a number that quietly
 *   resets. Refusing is more honest: the page shows a dash.
 * - Anywhere else, the JSON file. That is right for development and for a
 *   single self-hosted server with a persistent disk, and wrong for anything
 *   with more than one instance — which production is warned about.
 */
export function selectBackend(env: Env, cwd = process.cwd()): Backend {
  const url = read(env, "UPSTASH_REDIS_REST_URL", "KV_REST_API_URL");
  const token = read(env, "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN");
  const key = read(env, "VISITOR_COUNTER_KEY") ?? DEFAULT_KEY;

  if (url && token) return { kind: "redis", url, token, key };

  const half =
    url || token
      ? ` Only the ${url ? "URL" : "token"} is set; both are needed.`
      : "";

  if (env.VERCEL) {
    return {
      kind: "unavailable",
      reason:
        "No Redis credentials are configured, and a Vercel function has no " +
        "persistent disk to count on. Set KV_REST_API_URL and " +
        "KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and " +
        `UPSTASH_REDIS_REST_TOKEN).${half} See .env.example.`,
    };
  }

  return {
    kind: "file",
    path: join(cwd, ".data", "visits.json"),
    warning:
      env.NODE_ENV === "production"
        ? "No Redis credentials are configured, so visits are being written " +
          "to the local filesystem. That only holds together on a single " +
          "server with a persistent disk; with more than one instance the " +
          `count will drift and reset.${half} See .env.example.`
        : undefined,
  };
}

function unavailable(reason: string): VisitorCounter {
  const fail = () => Promise.reject(new Error(reason));
  return { increment: fail, getCount: fail };
}

let counter: VisitorCounter | undefined;

function create(): VisitorCounter {
  const backend = selectBackend(process.env);

  switch (backend.kind) {
    case "redis":
      return createRedisCounter(backend.url, backend.token, backend.key);
    case "unavailable":
      console.warn(`[visitors] ${backend.reason}`);
      return unavailable(backend.reason);
    case "file":
      if (backend.warning) console.warn(`[visitors] ${backend.warning}`);
      return createFileCounter(backend.path);
  }
}

/**
 * The counter, built once per process. Which implementation you get is a
 * question of configuration, and nothing above this line needs to know the
 * answer.
 */
export function getVisitorCounter(): VisitorCounter {
  counter ??= create();
  return counter;
}

export type { VisitorCounter } from "./types";
