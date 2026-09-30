import { MarginMark } from "@/components/decorative/MarginMark";
import { Section } from "@/components/layout/Section";
import { InlineList } from "@/components/ui/InlineList";
import { TechList } from "@/components/ui/TechIndex";
import { techIndex } from "@/content/crossref";
import { marks } from "@/content/marks";
import { sectionIndex } from "@/content/site";
import {
  exploring,
  skillGroups,
  skillsNote,
  type SkillLine,
} from "@/content/skills";
import { SKILLS_PLACE, technologyHint } from "@/content/technologies";
import styles from "./Skills.module.css";

/**
 * The inventory's names can be picked to see where else they appear. The
 * pencilled lines cannot: they are not claims, and a cross-reference would
 * read as one.
 */
function Line({
  line,
  crossReferenced = false,
}: {
  line: SkillLine;
  crossReferenced?: boolean;
}) {
  return (
    <div className={`${styles.line} ${line.label ? "" : styles.bare}`}>
      {line.label ? (
        <span className={styles.lineLabel}>{line.label}</span>
      ) : null}
      {crossReferenced ? (
        <TechList
          items={line.items}
          place={SKILLS_PLACE}
          className={styles.items}
        />
      ) : (
        <InlineList items={line.items} className={styles.items} />
      )}
    </div>
  );
}

export function Skills() {
  return (
    <Section
      id="skills"
      index={sectionIndex.skills}
      label="Skills"
      title="What I work with"
    >
      <p className="note">{skillsNote}</p>
      {Object.keys(techIndex).length > 0 ? (
        <p className={styles.hint}>{technologyHint}</p>
      ) : null}

      <dl className={styles.groups}>
        {skillGroups.map((group) => (
          <div key={group.title} className={styles.group}>
            <dt className="label">{group.title}</dt>
            <dd className={styles.lines}>
              {group.lines.map((line) => (
                <Line
                  key={line.label ?? line.items[0]}
                  line={line}
                  crossReferenced
                />
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

      <MarginMark {...marks.skills} top="38%" />
    </Section>
  );
}
