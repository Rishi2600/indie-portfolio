/**
 * Where the site lives, and whether it should be indexed.
 *
 * Pure functions of an environment, so the rules are testable and the build
 * (next.config.ts) and the application (content/site.ts) apply the same ones.
 */

export type Env = Readonly<Record<string, string | undefined>>;

/**
 * Vercel sets VERCEL_ENV on every build and function. Anything without it is
 * a local build or a self-hosted server.
 */
export type Deployment = "production" | "preview" | "development" | "other";

export function deploymentOf(env: Env): Deployment {
  const value = env.VERCEL_ENV;
  return value === "production" ||
    value === "preview" ||
    value === "development"
    ? value
    : "other";
}

const MISSING =
  "NEXT_PUBLIC_SITE_URL is required for a production deployment. It is the " +
  "origin every canonical URL, sitemap entry and social card is built from, " +
  "and there is no safe value to guess. Until a domain exists, use the " +
  "project's production address on Vercel, e.g. https://<project>.vercel.app " +
  "— set it in Project Settings → Environment Variables. See .env.example.";

/**
 * An origin — scheme and host, nothing after it. Anything else is refused
 * rather than trimmed: a path here would be silently prepended to every URL
 * the site builds.
 */
export function normaliseSiteUrl(value: string, requireHttps = false): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not an absolute URL: "${value}"`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`NEXT_PUBLIC_SITE_URL must be http or https: "${value}"`);
  }
  if (requireHttps && url.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must use https in production: "${value}"`,
    );
  }
  if (url.pathname !== "/" || url.search || url.hash || url.username) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be an origin with nothing after the host: "${value}"`,
    );
  }

  return url.origin;
}

/**
 * - An explicit NEXT_PUBLIC_SITE_URL always wins.
 * - A production deployment without one is an error, not a fallback.
 * - A preview deployment uses its own generated address.
 * - Everything else is a developer's machine.
 */
export function resolveSiteUrl(env: Env): string {
  const deployment = deploymentOf(env);
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicit) return normaliseSiteUrl(explicit, deployment === "production");
  if (deployment === "production") throw new Error(MISSING);

  const generated = env.VERCEL_URL?.trim();
  if (generated) return `https://${generated}`;

  return "http://localhost:3000";
}

/**
 * Preview and development deployments are public URLs that duplicate the
 * real site; search engines should not find them.
 */
export function isIndexable(env: Env): boolean {
  const deployment = deploymentOf(env);
  return deployment === "production" || deployment === "other";
}
