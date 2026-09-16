import { Colophon } from "@/components/layout/Colophon";
import { Folio } from "@/components/layout/Folio";
import { Masthead } from "@/components/layout/Masthead";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Learning } from "@/components/sections/Learning";
import { Notes } from "@/components/sections/Notes";
import { Now } from "@/components/sections/Now";
import { Opening } from "@/components/sections/Opening";
import { Skills } from "@/components/sections/Skills";
import { Work } from "@/components/sections/Work";

/**
 * One page, read top to bottom. The sections are numbered in the margin in
 * the order they appear here, and that numbering is the only thing that has
 * to stay in step with this file.
 */
export default function Page() {
  return (
    <>
      <a href="#content" className="skip">
        Skip to content
      </a>

      <Folio>
        <Masthead />

        <main id="content">
          <Opening />
          <Now />
          <Work />
          <Learning />
          <Skills />
          <About />
          <Notes />
          <Contact />
        </main>

        <Colophon />
      </Folio>
    </>
  );
}
