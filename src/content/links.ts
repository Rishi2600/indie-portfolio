export type ProfileLink = {
  label: string;
  /** The handle or address as it should read on the page. */
  value: string;
  href: string;
  /**
   * An address opens the reader's mail client; a profile is another page on
   * the web, and is marked as leaving this one.
   */
  kind: "email" | "profile";
};

/** Every address here is Rishi's own and approved for public display. */
export const elsewhere: readonly ProfileLink[] = [
  {
    label: "Email",
    value: "rishiraj61777@gmail.com",
    href: "mailto:rishiraj61777@gmail.com",
    kind: "email",
  },
  {
    label: "X",
    value: "@secur3shell",
    href: "https://x.com/secur3shell",
    kind: "profile",
  },
  {
    label: "GitHub",
    value: "Rishi2600",
    href: "https://github.com/Rishi2600",
    kind: "profile",
  },
  {
    label: "LinkedIn",
    value: "rishi-raj-687365232",
    href: "https://www.linkedin.com/in/rishi-raj-687365232",
    kind: "profile",
  },
];
