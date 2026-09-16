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
        <h1 className={styles.title}>There is no page at this address.</h1>
        <p className="prose">
          It may have been a mistype, or it may never have existed. The site is
          one page, so everything there is to read is at the beginning of it.
        </p>
        <p className={styles.back}>
          <Link className="link" href="/">
            Back to the beginning
          </Link>
        </p>
      </div>
    </Folio>
  );
}
