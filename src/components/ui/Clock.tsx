"use client";

import { formatTime, TIME_PLACEHOLDER } from "@/lib/time/format";
import { useClock } from "@/lib/time/useClock";
import styles from "./Clock.module.css";

const ZONES = [
  { abbr: "IST", name: "India Standard Time", timeZone: "Asia/Kolkata" },
  { abbr: "UTC", name: "Coordinated Universal Time", timeZone: "UTC" },
] as const;

type Props = {
  layout?: "row" | "stack";
};

/**
 * Two clocks, set as metadata rather than as a feature. Nothing here is a
 * live region: a screen reader announcing the seconds would be unusable, and
 * the time is incidental to everything else on the page.
 */
export function Clock({ layout = "row" }: Props) {
  const now = useClock();

  return (
    <dl
      className={`${styles.clock} ${layout === "stack" ? styles.stack : ""}`}
    >
      {ZONES.map((zone) => (
        <div key={zone.abbr} className={styles.zone}>
          <dt className="label">
            <abbr className={styles.abbr} title={zone.name}>
              {zone.abbr}
            </abbr>
          </dt>
          <dd className={`${styles.time} tabular`}>
            {now ? formatTime(now, zone.timeZone) : TIME_PLACEHOLDER}
          </dd>
        </div>
      ))}
    </dl>
  );
}
