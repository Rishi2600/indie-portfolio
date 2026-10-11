import { ViewTransition, type ReactNode } from "react";

/**
 * The part of a page that turns when the reader moves to another one.
 *
 * Going further into the book, it leaves to the left and the next page comes
 * in from the right, the way a page is turned; going back, the other way.
 * The masthead and the colophon stay put, since they are on every page, and
 * a navigation that has no direction (the browser's own back button, a link
 * from outside) simply swaps the page. styles/base.css has the motion, and
 * what it becomes for a reader who asks for less.
 *
 * It wraps each page rather than sitting in the layout, because a layout is
 * never replaced and so would never turn.
 */
const TURN = {
  "nav-forward": "turn-forward",
  "nav-back": "turn-back",
  default: "none",
};

export function Turn({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={TURN} exit={TURN} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
