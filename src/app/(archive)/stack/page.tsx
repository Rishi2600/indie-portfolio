import { Turn } from "@/components/layout/Turn";
import { Stack } from "@/components/sections/Stack";
import { TechIndexProvider } from "@/components/ui/TechIndex";
import { techIndex } from "@/content/crossref";
import { chapter } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata({
  title: "Stack",
  description: "What Rishi builds with: Rust, TypeScript, Go and Python, Node and Python backends, Solana and Anchor, React, PostgreSQL, MongoDB and the infra under them.",
  path: chapter("stack").href,
});

export default function Page() {
  return (
    <Turn>
      <TechIndexProvider index={techIndex}>
        <Stack />
      </TechIndexProvider>
    </Turn>
  );
}
