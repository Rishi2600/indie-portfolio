"use client";

import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  otherPlaces,
  technologyKey,
  type TechIndex,
} from "@/content/technologies";
import inline from "./InlineList.module.css";
import styles from "./TechIndex.module.css";

/**
 * A technology the reader has picked, and the spelling they picked it by.
 * `origin` is the one instance they clicked: every instance of the same
 * technology is marked, but only that one says where the others are.
 */
type Selection = { key: string; name: string; origin: string };

type Shared = {
  index: TechIndex;
  selection: Selection | null;
  toggle: (next: Selection) => void;
};

const TechContext = createContext<Shared | null>(null);

/**
 * The state behind the cross-reference: which technology, if any, is picked.
 *
 * Nothing is marked by this component itself. Each name reads the selection
 * and marks itself, and the work index marks an entry that holds a marked
 * name with a rule of its own, in CSS, so the entries need no JavaScript.
 *
 * Esc puts everything back. A name picked again does too.
 */
export function TechIndexProvider({
  index,
  children,
}: {
  index: TechIndex;
  children: ReactNode;
}) {
  const [selection, setSelection] = useState<Selection | null>(null);

  useEffect(() => {
    if (!selection) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelection(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selection]);

  const shared = useMemo<Shared>(
    () => ({
      index,
      selection,
      toggle: (next) =>
        setSelection((current) => (current?.key === next.key ? null : next)),
    }),
    [index, selection],
  );

  const places = selection ? (index[selection.key] ?? []) : [];

  return (
    <TechContext value={shared}>
      {children}
      {/* The marks are visual, so what they show is said once, here. */}
      <p className="visually-hidden" role="status">
        {selection
          ? `${selection.name} appears in ${places.map((p) => p.title).join(", ")}.`
          : ""}
      </p>
    </TechContext>
  );
}

/**
 * InlineList, with the names that turn up in more than one place made
 * selectable. Outside a provider, or for a name that appears once, it is
 * plain text and looks exactly like InlineList.
 *
 * `place` says which entry or section this list belongs to, so that the
 * place a reader is already in is not offered back to them.
 */
export function TechList({
  items,
  place,
  className,
}: {
  items: readonly string[];
  place: string;
  className?: string;
}) {
  return (
    <ul className={className}>
      {items.map((item, i) => (
        <li key={item} className={inline.item}>
          {i > 0 ? (
            <>
              {" "}
              <span className={inline.sep} aria-hidden="true">
                ·
              </span>{" "}
            </>
          ) : null}
          <Name name={item} place={place} />
        </li>
      ))}
    </ul>
  );
}

function Name({ name, place }: { name: string; place: string }) {
  const shared = useContext(TechContext);
  const origin = useId();
  const key = technologyKey(name);

  if (!shared || !Object.hasOwn(shared.index, key)) {
    return <span className={inline.name}>{name}</span>;
  }

  const { index, selection, toggle } = shared;
  const picked = selection?.key === key;
  const others =
    picked && selection.origin === origin ? otherPlaces(index, key, place) : [];

  return (
    <>
      <span className={inline.name}>
        <button
          type="button"
          className={styles.term}
          aria-pressed={picked}
          onClick={() => toggle({ key, name, origin })}
        >
          {name}
        </button>
      </span>
      {others.length > 0 ? (
        <span className={styles.where} role="group" aria-label="Also appears in">
          <span className="label">See also</span>{" "}
          {others.map((other, i) => (
            <Fragment key={other.id}>
              {i > 0 ? (
                <>
                  {" "}
                  <span className={inline.sep} aria-hidden="true">
                    ·
                  </span>{" "}
                </>
              ) : null}
              <a
                className={`numeral ${styles.place}`}
                href={other.href}
                aria-label={`${other.title}, ${other.label}`}
              >
                {other.label}
              </a>
            </Fragment>
          ))}
        </span>
      ) : null}
    </>
  );
}
