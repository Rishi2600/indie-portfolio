import { Section } from "@/components/layout/Section";
import { Wall } from "@/components/wall/Wall";
import { cave } from "@/content/cave";
import styles from "./TheWall.module.css";

/**
 * The back of the cave: one open stone for a visitor to leave something on.
 * Not a chapter of the archive (it is not in the reading order); every page
 * leads here from its foot (WallInvite).
 */
export function TheWall() {
  return (
    <Section id="wall" index="∞" label={cave.wall.label} title={cave.wall.title} level={1}>
      <p className={`prose ${styles.intro}`}>{cave.wall.intro}</p>
      <Wall />
    </Section>
  );
}
