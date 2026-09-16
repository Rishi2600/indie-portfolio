import { Section } from "@/components/layout/Section";
import { elsewhere } from "@/content/links";
import { profile } from "@/content/profile";
import styles from "./Contact.module.css";

/**
 * Two of these four rows are real and two are not yet. The unpublished ones
 * still get a line, because a gap the reader can see is worth more than a
 * profile quietly left out.
 */
export function Contact() {
  return (
    <Section
      id="contact"
      index="07"
      label="Contact"
      title={profile.contact.title}
    >
      <p className={styles.body}>{profile.contact.body}</p>

      <dl className={styles.links}>
        {elsewhere.map((entry) => (
          <div key={entry.label} className={styles.row}>
            <dt className="label">{entry.label}</dt>
            <dd className={styles.value}>
              {entry.href ? (
                <a
                  className={`link ${styles.link}`}
                  href={entry.href}
                  rel="me"
                >
                  {entry.value}
                  <span className={styles.arrow} aria-hidden="true">
                    ↗
                  </span>
                </a>
              ) : (
                <span className="pending">{entry.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
