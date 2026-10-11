import type { ReactNode } from "react";
import { Colophon } from "@/components/layout/Colophon";
import { Folio } from "@/components/layout/Folio";
import { Masthead } from "@/components/layout/Masthead";
import { PageTurn } from "@/components/layout/PageTurn";
import { ReadingOrderProvider } from "@/components/layout/ReadingOrder";
import { readingOrder } from "@/content/reading";

/**
 * Every page of the archive: the ruled page, the masthead, the page itself,
 * the way on to the next one, and the colophon. Only the middle changes from
 * page to page, and it is the only part that turns (components/layout/Turn).
 */
export default function ArchiveLayout({ children }: { children: ReactNode }) {
  return (
    <ReadingOrderProvider order={readingOrder}>
      <a href="#content" className="skip">
        Skip to content
      </a>

      <Folio>
        <Masthead />

        <main id="content">{children}</main>

        <PageTurn />

        <Colophon />
      </Folio>
    </ReadingOrderProvider>
  );
}
