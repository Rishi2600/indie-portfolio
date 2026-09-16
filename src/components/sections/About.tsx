import { Section } from "@/components/layout/Section";
import { profile } from "@/content/profile";
import styles from "./About.module.css";

/**
 * A blank left deliberately, and labelled as one. The alternative — filling
 * it with a paragraph nobody wrote — is the thing this site is trying not to
 * be.
 */
export function About() {
  const { pending, title } = profile.about;

  return (
    <Section id="about" index="05" label="About" title={title}>
      <p className={styles.unwritten}>{pending.heading}</p>

      <div className={`prose ${styles.body}`}>
        {pending.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}
