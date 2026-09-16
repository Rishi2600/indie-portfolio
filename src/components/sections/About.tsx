import { Rosette } from "@/components/decorative/Rosette";
import { Section } from "@/components/layout/Section";
import { profile } from "@/content/profile";
import styles from "./About.module.css";

export function About() {
  const { title, paragraphs, example } = profile.about;

  return (
    <Section id="about" index="05" label="About" title={title}>
      <div className={styles.layout}>
        <div className="prose">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.example}>
          <p className="label">{example.label}</p>
          <div className={styles.exampleBody}>
            {example.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className={styles.principle}>
            <Rosette size={17} className={styles.mark} />
            {example.principle}
          </p>
        </div>
      </div>
    </Section>
  );
}
