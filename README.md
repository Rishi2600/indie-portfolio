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
npm test         # the visit counter and the site-URL rules
npm run build
npm run check    # all four
```

## Configuration

Copy `.env.example` to `.env.local`. Nothing is required to run locally — the
visit counter falls back to a JSON file under `.data/` when no Redis
credentials are present.

## Deploying to Vercel

The site is a zero-configuration Next.js project: every page is static, and
the only function is the visit endpoint at `/api/visits`.

1. Import the repository into Vercel. The framework preset is detected; Node
   is pinned to 24.x through `engines`.
2. **Storage → Upstash for Redis**, connected to the project. This injects
   `KV_REST_API_URL` and `KV_REST_API_TOKEN`, which the counter reads.
3. **Settings → Environment Variables:** set `NEXT_PUBLIC_SITE_URL` for
   Production — the `https://<project>.vercel.app` address until a domain
   exists. A production build fails without it, deliberately.
4. Deploy. Preview deployments use their own address and send
   `noindex`; if they share the production Redis database, give them their own
   `VISITOR_COUNTER_KEY`.

When a custom domain is added, change `NEXT_PUBLIC_SITE_URL` and redeploy — it
is read at build time.

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
    visitors/   the visit counter, its storage backends, and their tests
    site-url.ts where the site lives, and whether to index it
  styles/       design tokens and base styles
```

`src/content` is the only place that holds copy. Adding a project or a skill
group means editing a data file, never a component.
