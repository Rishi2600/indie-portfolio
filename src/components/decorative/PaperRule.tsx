import styles from "./PaperRule.module.css";

type Props = {
  variant?: "hair" | "double";
  className?: string;
};

/**
 * A ruled line. Decorative, so it is hidden rather than announced as a
 * separator — the headings already describe the structure.
 */
export function PaperRule({ variant = "hair", className }: Props) {
  return (
    <hr
      aria-hidden="true"
      className={[styles.rule, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
