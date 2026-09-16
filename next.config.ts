import type { NextConfig } from "next";

/**
 * A hosting dashboard will happily save an environment variable with an empty
 * value, and an empty string is not the same thing as an unset one: `??`
 * fallbacks let it straight through. Clearing them here, before the build
 * workers fork, means the rest of the code only ever sees "set" or "absent".
 */
for (const key of [
  "NEXT_PUBLIC_SITE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "VISITOR_COUNTER_KEY",
]) {
  if (process.env[key]?.trim() === "") delete process.env[key];
}

const nextConfig: NextConfig = {
  // The visit counter is the only stateful thing here, and it is reached over
  // a route handler rather than during render, so every page stays static.
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
