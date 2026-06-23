# CLAUDE.md — Edustories docs site

Documentation site for the Edustories case-report platform, hosted at
**`docs.edustori.es`** (Cloudflare Pages, static export). Built on
[Fumadocs](https://fumadocs.dev) — Next.js App Router + `fumadocs-mdx`.

> This site was bootstrapped by adapting an existing Fumadocs docs site.
> It is intentionally minimal right now: a single English homepage, the
> multilingual machinery wired up, and the brand applied. Real product
> documentation is the next phase.

## Stack

- **Framework**: Next.js 16 (App Router, **static export** — `output: 'export'`)
- **Docs framework**: Fumadocs UI 16.8 + `fumadocs-mdx`
- **Lang**: TypeScript, MDX
- **Styling**: Tailwind v4 (CSS-first config in `src/app/global.css`)
- **Fonts**: Inter (sans + display), JetBrains Mono (code) — via `next/font/google`
- **Search**: Orama (static index served from `/api/search`)
- **OG images**: `next/og`
- **Package manager**: npm
- **Deploy target**: Cloudflare Pages

## Multilingual (i18n)

English is the only shipped language today, but the routing and switcher are
fully wired so adding a language is mechanical.

- `src/lib/i18n.ts` — `defineI18n`. `defaultLanguage: 'en'`, `languages: ['en']`,
  `hideLocale: 'never'`, `parser: 'dot'`.
- `src/lib/i18n-ui.ts` — `defineI18nUI` → `provider(locale)` for `RootProvider`'s
  `i18n` prop (carries locale, language list, and UI translations).
- `src/lib/source.ts` — the Fumadocs `loader` is given `i18n`.

Because the site is a **static export**, there is no Next.js middleware for
locale detection. Instead:

- Every locale carries an explicit URL prefix (`/en`, future `/cs`).
- Each locale is pre-rendered via `generateStaticParams` (driven by
  `i18n.languages`).
- The bare root `/` is a tiny static page (`src/app/page.tsx`) that
  meta-refreshes to `/en`.

### Adding a language (e.g. Czech)

1. Add the code to `i18n.languages` in `src/lib/i18n.ts` (e.g. `['en', 'cs']`).
2. Add a `displayName` (and optional UI string translations) under that key
   in `src/lib/i18n-ui.ts`.
3. Add localized content files alongside the English ones using the dot
   suffix: `index.mdx` (en) → `index.cs.mdx` (cs).
4. The language switcher in the nav populates automatically.
5. Consider moving the `<html>` tag from `src/app/layout.tsx` into
   `src/app/[lang]/layout.tsx` so the `lang` attribute tracks the active
   locale (today it is hardcoded `en`).

## URL structure

The site lives at `docs.edustori.es`, so there is **no `/docs` prefix**. With
i18n, every page sits under a locale segment:

- `/` → static redirect to `/en`
- `/en` — docs home (from `content/docs/index.mdx`)
- `/en/<page>` — pages within the docs

App-router files:

- `src/app/layout.tsx` — root layout (`<html>`/`<body>`, fonts, base metadata,
  org JSON-LD). Owns the html shell so the root redirect page is valid HTML.
- `src/app/page.tsx` — `/` → `/en` static redirect.
- `src/app/[lang]/layout.tsx` — `RootProvider` with the i18n provider + search.
- `src/app/[lang]/(docs)/layout.tsx` — Fumadocs `DocsLayout` (notebook),
  `tabs={false}` (no product switcher).
- `src/app/[lang]/(docs)/[[...slug]]/page.tsx` — catch-all docs page.
- `src/lib/source.ts` — Fumadocs source adapter (reads `content/docs/`).
- `src/lib/shared.ts` — `appName`, route constants, GitHub config.
- `src/lib/layout.shared.tsx` — base nav options (logo, links, language switch),
  takes the active `locale`.

Internal helper routes keep a `docs` segment for namespacing and are not
locale-segmented (one variant per page while English is the only language):
`/og/docs/[...slug]`, `/llms.mdx/docs/[[...slug]]`. Also non-localized:
`/api/search`, `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`.

## Content tree

```
content/docs/
└── index.mdx        # → /en   (frontmatter: title, description, verifiedAt)
```

Frontmatter is required (`title` + `description`). The optional `verifiedAt`
(ISO `YYYY-MM-DD`) drives the **"Verified <date>"** badge shown next to the
Copy-Markdown / View-Options buttons, and is the strongest signal for
`<lastmod>` in the sitemap. See `source.config.ts` and
`src/components/verified-badge.tsx`.

## Brand

- **Logo**: `public/logo.svg` (mark), `public/logo-horizontal.svg` (light),
  `public/logo-horizontal-dark.svg` (dark), `public/favicon.svg` /
  `public/favicon.ico`. Composed from the frontend brand assets
  (`frontend/static/edustories_logo.svg` + `edustories_text.svg`).
- **Colours**: Edustories tokens (`--color-es-*`) in `src/app/global.css`.
  Fumadocs's `--color-fd-primary` / `--color-fd-ring` map to Edustories blue
  `#305cde` (light) and a lighter tint `#7da0f5` (dark).
- **Fonts**: Inter for both body and headings, JetBrains Mono for code.

## Scripts

```sh
npm run dev      # dev server (http://localhost:3000)
npm run build    # static export → out/
npm run start    # serve production build

npm run format   # prettier --write . && eslint . --fix
npm run lint     # prettier --check . && eslint .
npm run check    # fumadocs-mdx && next typegen && tsc --noEmit
```

**After any code change**, run `npm run format && npm run lint && npm run check`.

## Things to NOT do

- **Don't hand-edit `src/api/...`-style generated output.** (N/A here, but the
  same discipline as the sibling repos.)
- **Don't add a product/app switcher.** Edustories is a single product; the
  switcher was removed deliberately (`tabs={false}`).
- **Don't reintroduce Parkinsans** or other display fonts — Inter only.

## Deploy (Cloudflare Pages)

- Framework preset: **Next.js (static export)**. Build command: `npm run build`.
  Output directory: `out`.
- Production branch: `main`. Production domain: `docs.edustori.es`.
