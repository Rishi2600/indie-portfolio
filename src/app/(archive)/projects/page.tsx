import { Turn } from "@/components/layout/Turn";
import { Work } from "@/components/sections/Work";
import { chapter } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata({
  title: "Work",
  description: "Things Rishi built: a CRM, Solana bounties, a shop for an ice brand, a consultancy site with a terminal, and real-time interview rooms.",
  path: chapter("work").href,
});

export default function Page() {
  return (
    <Turn>
      <Work />
    </Turn>
  );
}
