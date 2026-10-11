/**
 * The swallow, as path data: drawn by Birds.tsx and, as a shadow on the page
 * by day, by Daylight.tsx. Facing right, in a 48 by 24 box.
 */
export const BIRD_BOX = { width: 48, height: 24 } as const;

export const BIRD = {
  farWing: "M24 13C19.5 7.5 12.5 5.2 4.5 6.2C11 7.6 16.5 10.2 21 14Z",
  body: "M32 11.7C28.2 11 22 12 16 15.2C21.6 14.6 27.6 14.2 32 12.7Z",
  tail: "M16.4 15.1L12.6 14.2M16.4 15.1L13.4 17.4",
  nearWing: "M24 13C28 7 34 4.5 41.5 5C35.5 6.8 30.5 9.8 26.5 14Z",
  head: { cx: 32.2, cy: 12.1, r: 1 },
} as const;
