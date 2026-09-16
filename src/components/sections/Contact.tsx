import { Section } from "@/components/layout/Section";
import { elsewhere } from "@/content/links";
import { profile } from "@/content/profile";
import styles from "./Contact.module.css";

/**
 * The last page of the archive: one sentence and four addresses. Profiles
 * carry rel="me", which is how other sites verify that these accounts and
 * this page belong to the same person; the email does not, because an
 * address is not a page.
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
              <a
                className={`link ${styles.link}`}
                href={entry.href}
                rel={entry.kind === "profile" ? "me" : undefined}
              >
                {entry.value}
                {entry.kind === "profile" ? (
                  <span className={styles.arrow} aria-hidden="true">
                    ↗
                  </span>
                ) : null}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
