import styles from "./InlineList.module.css";

/**
 * A run of short items set on one line with interpuncts between them, as a
 * real list.
 *
 * The dots are ink, not content, so assistive technology is given the list
 * and not the punctuation. Each name is held together, so "AWS EC2" never
 * splits; the space after a dot is the only place a line may break, and the
 * no-break space before it keeps the dot at the end of a line rather than at
 * the start of the next.
 */
export function InlineList({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ul className={className}>
      {items.map((item, i) => (
        <li key={item} className={styles.item}>
          {i > 0 ? (
            <>
              {" "}
              <span className={styles.sep} aria-hidden="true">
                ·
              </span>{" "}
            </>
          ) : null}
          <span className={styles.name}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
