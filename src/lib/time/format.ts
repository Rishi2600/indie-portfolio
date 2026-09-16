/**
 * Formatting an Intl.DateTimeFormat is cheap; constructing one is not, and the
 * clock would otherwise build two of them a second for as long as the page is
 * open. They are immutable, so one per zone is kept.
 */
const timeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Wall-clock time in a named zone, 24-hour, zero-padded.
 *
 * hourCycle is pinned to h23 rather than left to the locale: en-GB with
 * hour12 false resolves to h24 on some engines, which renders midnight as
 * 24:00:00 instead of 00:00:00.
 */
export function formatTime(date: Date, timeZone: string): string {
  let formatter = timeFormatters.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    timeFormatters.set(timeZone, formatter);
  }

  return formatter.format(date);
}

/**
 * The same width as a rendered time, so the clock does not resize when it
 * starts ticking.
 */
export const TIME_PLACEHOLDER = "--:--:--";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  // Fixed to UTC so the string is identical on the server and in the browser.
  // These are calendar dates, not moments, and must not shift by timezone.
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "2026-09-16" becomes "16 Sep 2026". */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

/** Indian digit grouping: 1,284 and then 1,28,400. */
const countFormatter = new Intl.NumberFormat("en-IN");

export function formatCount(value: number): string {
  return countFormatter.format(value);
}
