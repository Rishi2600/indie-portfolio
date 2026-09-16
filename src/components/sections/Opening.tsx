import { MandalaMark } from "@/components/decorative/MandalaMark";
import { profile } from "@/content/profile";
import { site } from "@/content/site";
import styles from "./Opening.module.css";

export function Opening() {
  return (
    <section className={styles.opening} aria-labelledby="opening-title">
      <MandalaMark className={styles.watermark} size={336} />

      <div className={styles.inner}>
        <h1 id="opening-title" className={styles.name}>
          {site.name}
          <span className={styles.devanagari} lang="hi" aria-hidden="true">
            {site.nameDevanagari}
          </span>
        </h1>

        <div className={styles.opener} aria-hidden="true" />

        <p className={styles.lead}>{profile.opening.lead}</p>
        <p className={styles.body}>{profile.opening.body}</p>
      </div>
    </section>
  );
}
