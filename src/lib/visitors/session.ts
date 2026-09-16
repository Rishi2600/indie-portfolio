/**
 * How a visit is defined.
 *
 * Not a page render — React can render the page many times, and a refresh is
 * the same person. A visit is one browser that has not been here in the last
 * twelve hours, which is recorded with a cookie that holds a single "1" and
 * nothing else: no identifier, no timestamp, nothing that could be joined
 * against anything. It cannot be read by scripts, it is not sent on
 * cross-site requests, and it says nothing about the reader beyond the fact
 * that they have already been counted.
 */
export const VISIT_COOKIE = "visit";

export const VISIT_WINDOW_SECONDS = 60 * 60 * 12;

export const visitCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: VISIT_WINDOW_SECONDS,
} as const;
