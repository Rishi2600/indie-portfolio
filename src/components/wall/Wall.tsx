"use client";

import { useEffect, useRef, useState } from "react";
import { cave } from "@/content/cave";
import { brahmi } from "@/lib/wall/face";
import { openWall, type WallStore } from "@/lib/wall/store";
import { createSurface, type Surface } from "@/lib/wall/surface";
import styles from "./Wall.module.css";

/**
 * The bare stone at the back of the cave, and everything a visitor has left
 * on it. The marks are kept in this browser (lib/wall/store.ts) and painted
 * from scratch onto two canvases (lib/wall/surface.ts); this wires the two to
 * the page and to the visitor's hand.
 */
export function Wall() {
  const stone = useRef<HTMLDivElement>(null);
  const wallCanvas = useRef<HTMLCanvasElement>(null);
  const handCanvas = useRef<HTMLCanvasElement>(null);
  const store = useRef<WallStore | null>(null);
  const surface = useRef<Surface | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [lasting, setLasting] = useState(true);

  useEffect(() => {
    const box = stone.current;
    if (!box || !wallCanvas.current || !handCanvas.current) return;
    const painted = createSurface(wallCanvas.current, handCanvas.current, brahmi.style.fontFamily);
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

    return () => {
      gone = true;
      observer.disconnect();
      theme.disconnect();
      unlisten();
      store.current?.close();
      painted.destroy();
    };
  }, []);

  return (
    <div className={styles.wall}>
      <div ref={stone} className={styles.stone}>
        <canvas ref={wallCanvas} className={styles.layer} aria-hidden="true" />
        <canvas
          ref={handCanvas}
          className={styles.layer}
          role="img"
          aria-label={`Your wall, with ${count ?? 0} ${count === 1 ? "mark" : "marks"} on it`}
        />
        {count === 0 ? <p className={`label ${styles.empty}`}>{cave.wall.empty}</p> : null}
      </div>
      <p className={`note ${styles.status}`}>{lasting ? cave.wall.kept(count ?? 0) : cave.wall.unkept}</p>
    </div>
  );
}
