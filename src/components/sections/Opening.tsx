import { Backdrop } from "@/components/decorative/Backdrop";
import { Yantra } from "@/components/decorative/Yantra";
import { profile } from "@/content/profile";
import { site } from "@/content/site";
import styles from "./Opening.module.css";

export function Opening() {
  return (
    <section className={styles.opening} aria-labelledby="opening-title">
      <Backdrop>
        <div className={styles.figure}>
          <Yantra draw="load" stroke={0.5} />
        </div>
      </Backdrop>

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
