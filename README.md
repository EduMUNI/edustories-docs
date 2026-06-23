# Edustories Docs

Documentation site for the Edustories case-report platform, hosted at
**`docs.edustori.es`**. Built on [Fumadocs](https://fumadocs.dev) — Next.js
App Router + MDX, deployed as a static export to Cloudflare Pages.

## Stack

- **Framework**: Next.js 16 (App Router, static export)
- **Docs framework**: Fumadocs UI 16 + `fumadocs-mdx`
- **Lang**: TypeScript, MDX
- **Styling**: Tailwind v4
- **Linter / formatter**: ESLint + Prettier (with `prettier-plugin-tailwindcss`)
- **Search**: Orama (static)
- **OG images**: `next/og`
- **Fonts**: Inter + JetBrains Mono (via `next/font/google`)
- **i18n**: Fumadocs i18n, English-only today, switcher prepared for more
- **Package manager**: npm
- **Deploy**: Cloudflare Pages (`main` → production)

## Layout

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # root layout (html/body, fonts, metadata)
│   │   ├── page.tsx                     # / → /en static redirect
│   │   ├── [lang]/
│   │   │   ├── layout.tsx               # RootProvider + i18n provider + search
│   │   │   └── (docs)/
│   │   │       ├── layout.tsx           # DocsLayout (no product switcher)
│   │   │       └── [[...slug]]/page.tsx # catch-all docs page
│   │   ├── api/search/route.ts          # Orama static search index
│   │   ├── og/docs/[...slug]/           # OG image generator
│   │   ├── llms.mdx/docs/[[...slug]]/   # raw markdown for LLMs
│   │   ├── llms.txt, llms-full.txt      # llms.txt convention
│   │   └── global.css                   # brand tokens + Fumadocs overrides
│   ├── components/
│   │   ├── verified-badge.tsx           # "Verified <date>" badge
│   │   ├── sidebar-banner.tsx           # sidebar filter box
│   │   └── sidebar-search.tsx
│   └── lib/
│       ├── i18n.ts, i18n-ui.ts          # multilingual config + UI provider
│       ├── source.ts                    # Fumadocs source adapter
│       ├── shared.ts                    # routes, appName, GitHub config
│       └── layout.shared.tsx            # shared layout base options (per locale)
├── content/docs/index.mdx               # the homepage (English)
├── public/                              # logo + favicon assets
├── source.config.ts                     # fumadocs-mdx config
└── package.json
```

URLs carry a locale prefix (`/en`, future `/cs`); `/` redirects to `/en`.

## Local development

```sh
npm install
npm run dev      # http://localhost:3000

npm run format   # prettier --write . && eslint . --fix
npm run lint     # prettier --check . && eslint .
npm run check    # fumadocs-mdx && next typegen && tsc --noEmit
npm run build    # static export → out/
```

Run `npm run format && npm run lint && npm run check` after any change.

## Adding a page

Create `content/docs/<slug>.mdx` with `title` + `description` frontmatter (and
optional `verifiedAt: YYYY-MM-DD` for the "Verified" badge). It appears in the
sidebar automatically.

## Adding a language

See `CLAUDE.md` → "Adding a language". In short: add the code to
`i18n.languages`, give it a `displayName`, and add `*.<lang>.mdx` content files.

## Deploy

Cloudflare Pages, `main` branch auto-deploys to production. Build command
`npm run build`, output directory `out`. Production domain `docs.edustori.es`.
