import { Noto_Sans_Brahmi } from "next/font/google";

/**
 * The face writing on the wall is set in. Declared here, apart from the
 * site's own faces (lib/fonts.ts), so that only the wall's page loads it.
 */
export const brahmi = Noto_Sans_Brahmi({
  subsets: ["brahmi"],
  weight: ["400"],
  display: "swap",
});
