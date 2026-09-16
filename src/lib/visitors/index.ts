import { join } from "node:path";
import { createFileCounter } from "./file";
import { createRedisCounter } from "./redis";
import type { VisitorCounter } from "./types";

const DEFAULT_KEY = "portfolio:visits";
const DEVELOPMENT_PATH = join(process.cwd(), ".data", "visits.json");

let counter: VisitorCounter | undefined;

function create(): VisitorCounter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = process.env.VISITOR_COUNTER_KEY ?? DEFAULT_KEY;

  if (url && token) return createRedisCounter(url, token, key);

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[visitors] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are " +
        "not set, so visits are being written to the local filesystem. On " +
        "any host that does not give every instance the same persistent " +
        "disk, the count will drift and reset. See .env.example.",
    );
  }

  return createFileCounter(DEVELOPMENT_PATH);
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
