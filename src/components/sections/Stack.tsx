import { CavePainting } from "@/components/decorative/CavePainting";
import { MarginMark } from "@/components/decorative/MarginMark";
import { Section } from "@/components/layout/Section";
import { InlineList } from "@/components/ui/InlineList";
import { TechList, TechName } from "@/components/ui/TechIndex";
import { techIndex } from "@/content/crossref";
import { marks } from "@/content/marks";
import { chapter } from "@/content/site";
import {
  exploring,
  stack,
  stackIntro,
  type SkillLine,
  type StackGroup,
} from "@/content/skills";
import { SKILLS_PLACE, technologyHint } from "@/content/technologies";
import styles from "./Stack.module.css";

/**
 * A labelled line of names. The inked lines can be picked to see where else
 * a name turns up; the pencilled ones cannot, since they are not claims and
 * a cross-reference would read as one.
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

/** One group, in whichever form its record asks for. */
function Group({ group }: { group: StackGroup }) {
  switch (group.form) {
    case "names":
      return (
        <TechList items={group.items} place={SKILLS_PLACE} className={styles.names} />
      );
    case "sentence":
      return (
        <p className={styles.sentence}>
          {group.says.map((phrase, i) =>
            typeof phrase === "string" ? (
              phrase
            ) : (
              <TechName key={i} name={phrase.tech} place={SKILLS_PLACE} />
            ),
          )}
        </p>
      );
    case "lines":
      return (
        <div className={styles.lines}>
          {group.lines.map((line) => (
            <Line key={line.label ?? line.items[0]} line={line} crossReferenced />
          ))}
        </div>
      );
  }
}

export function Stack() {
  const { numeral, label } = chapter("stack");

  return (
    <Section id="stack" index={numeral} label={label} title="What I build with" level={1}>
      <p className="note">{stackIntro}</p>
      {Object.keys(techIndex).length > 0 ? (
        <p className={styles.hint}>{technologyHint}</p>
      ) : null}

      <dl className={styles.groups}>
        {stack.map((group) => (
          <div key={group.title} className={styles.group}>
            <dt className="label">{group.title}</dt>
            <dd>
              <Group group={group} />
            </dd>
          </div>
        ))}
      </dl>

      <section className={styles.exploring} aria-labelledby="exploring-title">
        <div className={styles.exploringHead}>
          <h2 id="exploring-title" className={styles.exploringTitle}>
            {exploring.title}
          </h2>
          <p className={styles.exploringNote}>{exploring.note}</p>
        </div>
        <div className={styles.exploringLines}>
          {exploring.lines.map((line) => (
            <Line key={line.label} line={line} />
          ))}
        </div>
      </section>

      <MarginMark {...marks.stack} top="38%" />
      <CavePainting kind="dancers" top="70%" />
    </Section>
  );
}
