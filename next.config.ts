import type { NextConfig } from "next";
import { resolveSiteUrl } from "./src/lib/site-url";

/**
 * A hosting dashboard will happily save an environment variable with an empty
 * value, and an empty string is not the same thing as an unset one: `??`
 * fallbacks let it straight through. Clearing them here, before the build
 * workers fork, means the build only ever sees "set" or "absent". (Functions
 * at runtime do not run this file, so the code that reads these at runtime
 * treats blank values as absent too.)
 */
for (const key of [
  "NEXT_PUBLIC_SITE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "VISITOR_COUNTER_KEY",
]) {
  if (process.env[key]?.trim() === "") delete process.env[key];
}

/**
 * A production deployment without a site URL fails here, with a sentence that
 * names the variable, rather than shipping canonical links to localhost.
 */
try {
  resolveSiteUrl(process.env);
} catch (error) {
  console.error(`\n  ✖ ${(error as Error).message}\n`);
  throw error;
}

/**
 * A production deployment without Redis still builds — the page is useful
 * without a visit count — but it says so, because the count will be a dash.
 */
const hasRedis =
  Boolean(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN);

if (process.env.VERCEL_ENV === "production" && !hasRedis) {
  console.warn(
    "\n  ⚠ No Redis credentials are set for this production deployment. The " +
      "visit counter will show a dash until KV_REST_API_URL and " +
      "KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* pair) are provided. " +
      "See .env.example.\n",
  );
}

const nextConfig: NextConfig = {
  // The visit counter is the only stateful thing here, and it is reached over
  // a route handler rather than during render, so every page stays static.
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
