"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Rosette } from "./Rosette";
import styles from "./MarginMark.module.css";

/**
 * A small rosette in the margin that opens a note, the way a reader or a
 * scribe leaves a mark beside a passage.
 *
 * It is a real button, so it can be found and used by keyboard and named by
 * assistive technology, and it is the one ornament on the site that is meant
 * to be found rather than seen. It lives in the margin the ruled page leaves,
 * and so only exists where there is one: on a narrow screen, where the margin
 * is gone, the mark is too.
 *
 * The note closes on Esc, on a click anywhere else, or on the mark again.
 * Place it inside a positioned ancestor — a Section is one — and say how far
 * down that ancestor it sits.
 */
export function MarginMark({
  label,
  note,
  top,
}: {
  label: string;
  note: string;
  /** How far down the section the mark sits, as a CSS length. */
  top: string;
}) {
  const [open, setOpen] = useState(false);
  const noteId = useId();
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <span
      ref={root}
      className={styles.mark}
      style={{ "--top": top } as CSSProperties}
    >
      <button
        type="button"
        className={styles.button}
        aria-label={label}
        aria-expanded={open}
        aria-controls={noteId}
        onClick={() => setOpen((current) => !current)}
      >
        <Rosette size={13} />
      </button>
      <p id={noteId} className={styles.note} data-open={open}>
        {note}
      </p>
    </span>
  );
}
