import { Turn } from "@/components/layout/Turn";
import { Learning } from "@/components/sections/Learning";
import { Now } from "@/components/sections/Now";
import { chapter } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata({
  title: "Now",
  description: "What Rishi is doing right now, and what he's learning while he does it.",
  path: chapter("now").href,
});

export default function Page() {
  return (
    <Turn>
      <Now />
      <Learning />
    </Turn>
  );
}
