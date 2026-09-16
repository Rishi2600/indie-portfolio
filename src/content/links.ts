export type ProfileLink = {
  label: string;
  /** The handle or address as it should read on the page. */
  value: string;
  /**
   * Absent means the profile is not published yet. The row still renders —
   * an acknowledged gap is more honest than a missing line — but it is not a
   * link, and it is marked as pending.
   */
  href?: string;
};

export const elsewhere: readonly ProfileLink[] = [
  { label: "X", value: "@secur3shell", href: "https://x.com/secur3shell" },
  {
    label: "GitHub",
    value: "Rishi2600",
    href: "https://github.com/Rishi2600",
  },
  { label: "LinkedIn", value: "To be added" },
  { label: "Email", value: "To be added" },
];

export const PENDING = "To be added";
