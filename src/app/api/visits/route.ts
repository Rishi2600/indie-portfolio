import { NextResponse, type NextRequest } from "next/server";
import { getVisitorCounter } from "@/lib/visitors";
import { allow, fingerprint } from "@/lib/visitors/rate-limit";
import { VISIT_COOKIE, visitCookieOptions } from "@/lib/visitors/session";

/** Counting is a side effect; nothing about this may be cached. */
export const dynamic = "force-dynamic";

function unavailable() {
  // The page renders a dash when this happens. A footer statistic is not
  // worth telling the reader anything about.
  return NextResponse.json({ error: "unavailable" }, { status: 503 });
}

/**
 * Records a visit, or reports the total if this browser has already been
 * counted inside the window.
 *
 * The request has no body and the client cannot influence the total — it
 * cannot propose a count, only ask to be counted once. That is deliberate:
 * a number a visitor can set is not a number worth showing.
 */
export async function POST(request: NextRequest) {
  // Sec-Fetch-Site is set by the browser and cannot be spoofed by page
  // script, so a page on another origin cannot quietly run up the count by
  // embedding this endpoint. Absent or "none" means a direct request, which
  // is fine.
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!allow(fingerprint(request))) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const counter = getVisitorCounter();
  const alreadyCounted = request.cookies.has(VISIT_COOKIE);

  try {
    const count = alreadyCounted
      ? await counter.getCount()
      : await counter.increment();

    const response = NextResponse.json({ count });
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
  if (!allow(fingerprint(request))) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  try {
    return NextResponse.json({ count: await getVisitorCounter().getCount() });
  } catch (error) {
    console.error("[visitors] could not read the visit count", error);
    return unavailable();
  }
}
