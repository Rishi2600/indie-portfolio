import { Turn } from "@/components/layout/Turn";
import { TheWall } from "@/components/sections/TheWall";
import { cave } from "@/content/cave";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata({
  title: cave.wall.title,
  description: cave.wall.invite,
  path: cave.wall.href,
});

export default function Page() {
  return (
    <Turn>
      <TheWall />
    </Turn>
  );
}
