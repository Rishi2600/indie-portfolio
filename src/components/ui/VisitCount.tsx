"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/time/format";
import styles from "./VisitCount.module.css";

/**
 * Cached at module scope rather than in a ref, so a visit is registered once
 * per page load however many times this component mounts. React's strict mode
 * runs effects twice in development, and the second call would otherwise race
 * the first response's cookie and count the same reader twice.
 */
let pending: Promise<number> | undefined;

function registerVisit(): Promise<number> {
  pending ??= fetch("/api/visits", { method: "POST" }).then(async (response) => {
    if (!response.ok) throw new Error(`Visit endpoint sent ${response.status}`);

    const body: unknown = await response.json();
    const count = (body as { count?: unknown }).count;

    if (typeof count !== "number" || !Number.isFinite(count)) {
      throw new Error("Visit endpoint sent no usable count");
    }
    return count;
  });

  return pending;
}

/**
 * The count is fetched from the browser rather than rendered on the server,
 * which keeps the whole page static and means a reader with JavaScript
 * disabled — or a crawler — is never counted. The dash is the resting state:
 * it is what shows before the number arrives and what it stays if the store
 * cannot be reached.
 */
export function VisitCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    registerVisit()
      .then((value) => {
        if (active) setCount(value);
      })
      .catch(() => {
        // Leave the dash. A footer statistic is not worth an error state.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <dl className={styles.count}>
      <dt className="label">Visitors</dt>
      <dd className={styles.value}>
        {count === null ? (
          <span className={styles.waiting} aria-hidden="true">
            —
          </span>
        ) : (
          <span className="tabular">{formatCount(count)}</span>
        )}
      </dd>
    </dl>
  );
}
