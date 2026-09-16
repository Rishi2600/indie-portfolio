import { Section } from "@/components/layout/Section";
import { skillGroups, skillsNote } from "@/content/skills";
import styles from "./Skills.module.css";

export function Skills() {
  return (
    <Section id="skills" index="04" label="Skills" title="What I work with">
      <p className={`prose ${styles.note}`}>{skillsNote}</p>

      <dl className={styles.groups}>
        {skillGroups.map((group) => (
          <div key={group.title} className={styles.group}>
            <dt className="label">{group.title}</dt>
            <dd className={styles.values}>
              {group.skills.length > 0 ? (
                group.skills.join(" · ")
              ) : (
                <span className="pending" aria-label="Not listed yet">
                  —
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
