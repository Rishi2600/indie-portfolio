/**
 * Gold leaf for a mark, as an SVG gradient: deep gold with a band of light
 * across it. Daylight moves the band as the page is scrolled (gild()), as
 * gilding catches the light when a page is tilted towards a window. At
 * night, in high contrast and in print the mark is ink again (base.css).
 *
 * Place inside the mark's <svg> and paint it with `url(#id)`.
 */
export function GoldLeaf({ id }: { id: string }) {
  const deep = { stopColor: "var(--gilt-deep)" };
  const light = { stopColor: "var(--gilt-light)" };
  return (
    <defs>
      <linearGradient id={id} data-glint="" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style={deep} />
        <stop offset="0.17" style={deep} />
        <stop offset="0.35" style={light} />
        <stop offset="0.53" style={deep} />
        <stop offset="1" style={deep} />
      </linearGradient>
    </defs>
  );
}
