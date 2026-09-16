# rishi — personal site

A personal site built as an editorial object: paper, ink, and marginalia,
rather than a card grid. Next.js App Router, TypeScript, plain CSS with
CSS Modules.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npm run check    # all three
```

## Configuration

Copy `.env.example` to `.env.local`. Nothing is required to run locally — the
visit counter falls back to a JSON file under `.data/` when no Redis
credentials are present.

## Layout of the source

```
src/
  app/          routes, metadata, the visit-count route handler
  components/
    layout/     the folio frame, sections, masthead, colophon
    sections/   one file per section of the page
    ui/         clock, visit count, reveal-on-scroll
    decorative/ the ornament system (SVG, drawn in code)
  content/      every piece of copy and data on the site
  lib/
    time/       IST / UTC clock
    visitors/   the visit counter and its storage backends
  styles/       design tokens and base styles
```

`src/content` is the only place that holds copy. Adding a project or a skill
group means editing a data file, never a component.
