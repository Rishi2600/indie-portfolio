import { NextResponse, type NextRequest } from "next/server";
import { getVisitorCounter } from "@/lib/visitors";
import { allow, fingerprint } from "@/lib/visitors/rate-limit";
import { VISIT_COOKIE, visitCookieOptions } from "@/lib/visitors/session";

/** Counting is a side effect; nothing about this may be cached. */
export const dynamic = "force-dynamic";

/**
 * Every response says so as well, so that no CDN or browser in between can
 * hand one reader another reader's number, or a stale one.
 */
function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

// The page renders a dash when the store is down. A footer statistic is not
// worth telling the reader anything more about.
const unavailable = () => reply({ error: "unavailable" }, 503);
const tooMany = () => reply({ error: "too many requests" }, 429);

/**
 * Records a visit, or reports the total if this browser has already been
 * counted inside the window.
 *
 * The request body is never read, so the client cannot influence the total —
 * it cannot propose a count, only ask to be counted once. That is deliberate:
 * a number a visitor can set is not a number worth showing.
 */
export async function POST(request: NextRequest) {
  // Sec-Fetch-Site is set by the browser and cannot be spoofed by page
  // script, so a page on another origin cannot quietly run up the count by
  // embedding this endpoint. Absent or "none" means a direct request, which
  // is fine.
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return reply({ error: "forbidden" }, 403);
  }

  if (!allow(fingerprint(request))) return tooMany();

  const counter = getVisitorCounter();
  const alreadyCounted = request.cookies.has(VISIT_COOKIE);

  try {
    const count = alreadyCounted
      ? await counter.getCount()
      : await counter.increment();

    const response = reply({ count });
    // Only once the visit is actually recorded. If the store failed, the
    // reader carries no cookie and is counted on their next request.
    if (!alreadyCounted) {
      response.cookies.set(VISIT_COOKIE, "1", visitCookieOptions);
    }
    return response;
  } catch (error) {
    console.error("[visitors] could not record a visit", error);
    return unavailable();
  }
}

/** The total, with nothing recorded. */
export async function GET(request: NextRequest) {
  if (!allow(fingerprint(request))) return tooMany();

  try {
    return reply({ count: await getVisitorCounter().getCount() });
  } catch (error) {
    console.error("[visitors] could not read the visit count", error);
    return unavailable();
  }
}
