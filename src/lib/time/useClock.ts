"use client";

import { useEffect, useState } from "react";

/**
 * The current moment, re-read once a second.
 *
 * Returns null until the component has mounted. The server has no business
 * guessing what time it is in the reader's browser, and rendering a real time
 * on the server would mismatch on hydration within the same second; callers
 * render a placeholder of the same width instead.
 *
 * Ticks are scheduled onto the next whole second rather than every 1000ms, so
 * the display changes when the second actually changes and cannot drift. The
 * timer stops while the tab is hidden and catches up the moment it is not.
 */
export function useClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (document.visibilityState === "hidden") return;
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };

    function tick() {
      setNow(new Date());
      schedule();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
      } else {
        schedule();
      }
    };

    tick();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer !== undefined) clearTimeout(timer);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  return now;
}
