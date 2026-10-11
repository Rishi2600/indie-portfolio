import { MarginMark } from "@/components/decorative/MarginMark";
import { Rosette } from "@/components/decorative/Rosette";
import { Section } from "@/components/layout/Section";
import { profile } from "@/content/profile";
import { marks } from "@/content/marks";
import { chapter } from "@/content/site";
import styles from "./About.module.css";

export function About() {
  const { title, paragraphs, example } = profile.about;
  const { numeral, label } = chapter("about");

  return (
    <Section
      id="about"
      index={numeral}
      label={label}
      title={title}
      level={1}
    >
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

      <MarginMark {...marks.about} top="20%" />
    </Section>
  );
}
