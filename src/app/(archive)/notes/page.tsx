import { Turn } from "@/components/layout/Turn";
import { Notes } from "@/components/sections/Notes";
import { chapter } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata({
  title: "Notes",
  description: "Where Rishi writes down what he learns, builds and breaks. Nothing on the shelf yet.",
  path: chapter("notes").href,
});

export default function Page() {
  return (
    <Turn>
      <Notes />
    </Turn>
  );
}
