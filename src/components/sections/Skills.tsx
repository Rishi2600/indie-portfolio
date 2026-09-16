import { Section } from "@/components/layout/Section";
import {
  exploring,
  skillGroups,
  skillsNote,
  type SkillLine,
} from "@/content/skills";
import styles from "./Skills.module.css";

function Line({ line }: { line: SkillLine }) {
  return (
    <div className={`${styles.line} ${line.label ? "" : styles.bare}`}>
      {line.label ? (
        <span className={styles.lineLabel}>{line.label}</span>
      ) : null}
      <ul className={styles.items}>
        {line.items.map((item, i) => (
          <li key={item} className={styles.item}>
            {/* The space after the dot is the only place a line may break.
                Each name is held together, so "AWS EC2" never splits, and the
                no-break space before the dot keeps it at the end of a line
                rather than at the start of the next. */}
            {i > 0 ? (
              <>
                {"\u00a0"}
                <span className={styles.sep} aria-hidden="true">
                  ·
                </span>{" "}
              </>
            ) : null}
            <span className={styles.name}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Skills() {
  return (
    <Section id="skills" index="04" label="Skills" title="What I work with">
      <p className="note">{skillsNote}</p>

      <dl className={styles.groups}>
        {skillGroups.map((group) => (
          <div key={group.title} className={styles.group}>
            <dt className="label">{group.title}</dt>
            <dd className={styles.lines}>
              {group.lines.map((line) => (
                <Line key={line.label ?? line.items[0]} line={line} />
              ))}
            </dd>
          </div>
        ))}
      </dl>

      <section className={styles.exploring} aria-labelledby="exploring-title">
        <div className={styles.exploringHead}>
          <h3 id="exploring-title" className={styles.exploringTitle}>
            {exploring.title}
          </h3>
          <p className={styles.exploringNote}>{exploring.note}</p>
        </div>
        <div className={styles.exploringLines}>
          {exploring.lines.map((line) => (
            <Line key={line.label} line={line} />
          ))}
        </div>
      </section>
    </Section>
  );
}
