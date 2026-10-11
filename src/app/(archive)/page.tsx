import { Turn } from "@/components/layout/Turn";
import { Contents } from "@/components/sections/Contents";
import { Opening } from "@/components/sections/Opening";

/**
 * The front of the book: who this is, and what is in it. Everything else is
 * a page of its own (content/site.ts has the chapters), so this page is short
 * on purpose.
 */
export default function Page() {
  return (
    <Turn>
      <Opening />
      <Contents />
    </Turn>
  );
}
