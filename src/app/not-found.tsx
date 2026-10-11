import type { Metadata } from "next";
import Link from "next/link";
import { MandalaMark } from "@/components/decorative/MandalaMark";
import { Folio } from "@/components/layout/Folio";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Folio>
      <div className={styles.page}>
        <MandalaMark className={styles.mark} size={30} />
        <p className="numeral">404</p>
        <h1 className={styles.title}>Nothing here. I didn&apos;t break this one, I promise.</h1>
        <p className="prose">
          Maybe a typo, maybe it never existed. Everything that does exist
          starts at the front.
        </p>
        <p className={styles.back}>
          <Link className="link" href="/">
            Back to the front
          </Link>
        </p>
      </div>
    </Folio>
  );
}
