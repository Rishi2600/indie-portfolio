import { Turn } from "@/components/layout/Turn";
import { About } from "@/components/sections/About";
import { chapter } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata({
  title: "About",
  description: "Rishi likes breaking things more than building them. Here's why, and the time he built a GatherTown-style office from scratch.",
  path: chapter("about").href,
});

export default function Page() {
  return (
    <Turn>
      <About />
    </Turn>
  );
}
