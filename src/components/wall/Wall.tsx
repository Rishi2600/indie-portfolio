"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cave } from "@/content/cave";
import { toBrahmi } from "@/lib/wall/brahmi";
import { brahmi } from "@/lib/wall/face";
import { LETTER, listen, TOOLS, type Tool } from "@/lib/wall/gesture";
import { MAX_TEXT, PIGMENTS, WALL_H, WALL_W, type Mark, type Pigment, type WritingMark } from "@/lib/wall/marks";
import { askToKeep, openWall, type WallStore } from "@/lib/wall/store";
import { createSurface, type Surface } from "@/lib/wall/surface";
import styles from "./Wall.module.css";

type At = { x: number; y: number };

/** Where writing starts when nobody has pointed: the wall's top left, a line in. */
const FIRST_LINE: At = { x: 60, y: 140 };

/**
 * The bare stone at the back of the cave, and everything a visitor has left
 * on it. The marks are kept in this browser (lib/wall/store.ts), painted
 * from scratch onto two canvases (lib/wall/surface.ts), and made by the
 * visitor's hand (lib/wall/gesture.ts); this wires the three to the page.
 *
 * Writing is typed into a real input, so a keyboard, a screen reader and a
 * phone's own keyboard all work; the wall shows it in Brahmi as it is typed,
 * at the caret, and Enter puts it up.
 */
export function Wall() {
  const stone = useRef<HTMLDivElement>(null);
  const wallCanvas = useRef<HTMLCanvasElement>(null);
  const handCanvas = useRef<HTMLCanvasElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const store = useRef<WallStore | null>(null);
  const surface = useRef<Surface | null>(null);
  const toolRef = useRef<Tool>("paint");
  const pigmentRef = useRef<Pigment>("ochre");
  const [tool, setTool] = useState<Tool>("paint");
  const [pigment, setPigment] = useState<Pigment>("ochre");
  const [count, setCount] = useState<number | null>(null);
  const [lasting, setLasting] = useState(true);
  const [caret, setCaret] = useState<At | null>(null);
  const [text, setText] = useState("");
  const [sure, setSure] = useState(false);
  const asked = useRef(false);

  /** Keeps a finished mark: on the wall at once, then in the browser. */
  async function keep(mark: Mark) {
    surface.current?.add(mark);
    setCount((n) => (n ?? 0) + 1);
    try {
      await store.current?.add(mark);
      // Once there is something worth keeping, and only once a visit.
      if (!asked.current) {
        asked.current = true;
        void askToKeep();
      }
    } catch {
      // Out of room, or storage refused: it stays for this visit only.
      setLasting(false);
    }
  }

  // The hand's listener is attached once; it reaches the latest keep() here.
  const keepRef = useRef(keep);
  useEffect(() => {
    keepRef.current = keep;
  });

  useEffect(() => {
    const box = stone.current;
    const hand = handCanvas.current;
    if (!box || !wallCanvas.current || !hand) return;
    const painted = createSurface(wallCanvas.current, hand, brahmi.style.fontFamily);
    surface.current = painted;
    let gone = false;

    const fit = () => {
      const width = box.getBoundingClientRect().width;
      if (width > 0) painted.resize(width);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    const theme = new MutationObserver(() => painted.repaint());
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const reload = async () => {
      const all = (await store.current?.all()) ?? [];
      if (gone) return;
      setCount(all.length);
      painted.show(all);
    };

    let unlisten = () => {};
    void openWall().then(async (opened) => {
      if (gone) return opened.close();
      store.current = opened;
      setLasting(opened.lasting);
      unlisten = opened.onChange(() => void reload());
      // Writing waits for its face, or it would be painted in a fallback.
      await document.fonts.load(`40px ${brahmi.style.fontFamily}`, "\u{11013}").catch(() => undefined);
      await reload();
    });

    const release = listen(hand, {
      tool: () => toolRef.current,
      pigment: () => pigmentRef.current,
      making: (mark) => painted.making(mark),
      made: (mark) => void keepRef.current(mark),
      writeAt: (at) => {
        setCaret(at);
        input.current?.focus({ preventScroll: true });
      },
    });

    return () => {
      gone = true;
      observer.disconnect();
      theme.disconnect();
      unlisten();
      release();
      store.current?.close();
      painted.destroy();
    };
  }, []);

  /** The words being typed, as a mark, wherever the caret is. */
  const writing = (words: string, at: At): WritingMark => ({
    kind: "writing",
    pigment: pigmentRef.current,
    x: at.x,
    y: at.y,
    size: LETTER,
    text: words,
    seed: 1,
    made: Date.now(),
  });

  // Show the words on the wall, wet, as they are typed.
  useEffect(() => {
    surface.current?.making(caret && text.trim() ? writing(text, caret) : null);
  }, [caret, text, pigment]);

  function putUp() {
    if (caret && text.trim()) {
      void keep(writing(text.trim(), caret));
      const below = caret.y + LETTER * 1.6;
      setCaret(below < WALL_H - LETTER * 0.5 ? { x: caret.x, y: below } : null);
    }
    setText("");
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      putUp();
    } else if (event.key === "Escape") {
      setText("");
      setCaret(null);
    }
  }

  function pickTool(next: Tool) {
    toolRef.current = next;
    setTool(next);
    if (next !== "write") {
      putUp();
      setCaret(null);
    }
  }

  function pickPigment(next: Pigment) {
    pigmentRef.current = next;
    setPigment(next);
  }

  async function wash() {
    if (!sure) {
      setSure(true);
      window.setTimeout(() => setSure(false), 4000);
      return;
    }
    setSure(false);
    await store.current?.wash().catch(() => undefined);
    surface.current?.show([]);
    setCount(0);
  }

  function take() {
    const ground = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
    surface.current?.picture(ground).toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "my-cave-wall.png";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, "image/png");
  }

  // Where the caret sits: after the words, measured in wall units.
  const caretAt = caret ?? (tool === "write" ? FIRST_LINE : null);
  const typed = caretAt && text ? measure(text) : 0;

  return (
    <div className={styles.wall}>
      <div ref={stone} className={styles.stone} data-tool={tool}>
        <canvas ref={wallCanvas} className={styles.layer} aria-hidden="true" />
        <canvas
          ref={handCanvas}
          className={styles.layer}
          role="img"
          aria-label={`Your wall, with ${count ?? 0} ${count === 1 ? "mark" : "marks"} on it`}
        />
        {count === 0 && !text ? <p className={`label ${styles.empty}`}>{cave.wall.empty}</p> : null}
        {tool === "write" && caretAt ? (
          <span
            className={styles.caret}
            aria-hidden="true"
            style={{
              left: `${((caretAt.x + typed) / WALL_W) * 100}%`,
              top: `${((caretAt.y - LETTER * 0.95) / WALL_H) * 100}%`,
              height: `${((LETTER * 1.15) / WALL_H) * 100}%`,
            }}
          />
        ) : null}
      </div>

      <div className={styles.tools}>
        <div className={`label ${styles.group}`} role="group" aria-label="Pigment">
          {PIGMENTS.map((p) => (
            <button
              key={p}
              type="button"
              className={styles.option}
              aria-pressed={pigment === p}
              onClick={() => pickPigment(p)}
            >
              <span className={styles.swatch} data-pigment={p} aria-hidden="true" />
              {cave.wall.pigments[p]}
            </button>
          ))}
        </div>

        <div className={`label ${styles.group}`} role="group" aria-label="Tool">
          {TOOLS.map((t) => (
            <button
              key={t}
              type="button"
              className={styles.option}
              aria-pressed={tool === t}
              onClick={() => pickTool(t)}
            >
              {cave.wall.tools[t]}
            </button>
          ))}
        </div>

        {tool === "write" ? (
          <label className={styles.writing}>
            <span className="label">{cave.wall.writing}</span>
            <input
              ref={input}
              type="text"
              value={text}
              maxLength={MAX_TEXT}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="done"
              onChange={(event) => {
                if (!caret) setCaret(FIRST_LINE);
                setText(event.target.value);
              }}
              onKeyDown={onKey}
              onBlur={putUp}
            />
            {text ? (
              <span className={`${styles.preview} ${brahmi.className}`} lang="pra-Brah">
                {toBrahmi(text)}
              </span>
            ) : null}
          </label>
        ) : null}

        <div className={`label ${styles.group}`}>
          <button type="button" className={styles.option} onClick={take} disabled={!count}>
            {cave.wall.take}
          </button>
          <button type="button" className={styles.option} data-sure={sure || undefined} onClick={() => void wash()} disabled={!count}>
            {sure ? cave.wall.washSure : cave.wall.wash}
          </button>
        </div>
      </div>

      <p className={`note ${styles.status}`}>{lasting ? cave.wall.kept(count ?? 0) : cave.wall.unkept}</p>
    </div>
  );
}

/** How wide words are on the wall, in wall units, in the Brahmi face. */
let ruler: CanvasRenderingContext2D | null = null;
function measure(words: string): number {
  if (typeof document === "undefined") return 0;
  ruler ??= document.createElement("canvas").getContext("2d");
  if (!ruler) return 0;
  ruler.font = `${LETTER}px ${brahmi.style.fontFamily}`;
  return ruler.measureText(toBrahmi(words)).width;
}
