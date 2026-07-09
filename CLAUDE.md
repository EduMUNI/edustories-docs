# CLAUDE.md — Edustories docs site

Documentation site for the Edustories case-report platform, hosted at
**`docs.edustori.es`** (Cloudflare Pages, static export). Built on
[Fumadocs](https://fumadocs.dev) — Next.js App Router + `fumadocs-mdx`.

> This site was bootstrapped by adapting an existing Fumadocs docs site.
> The English documentation now spans the full product (getting-started,
> case-reports, training, EduPlay, AI assistant, account, VR); Czech (`cs`) is
> being translated. The multilingual machinery — routing, switcher, per-locale
> translated slugs — and the brand are all in place.

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

English is the primary language; Czech (`cs`) is being added. Routing, the
switcher, per-locale **translated slugs**, and the `<html lang>` attribute are
all wired, so adding content in a new language is mostly a matter of dropping
in files.

- `src/lib/i18n.ts` — `defineI18n`. `defaultLanguage: 'en'`,
  `languages: ['en', 'cs']`, `hideLocale: 'never'`, `parser: 'dot'`.
- `src/lib/i18n-ui.ts` — `defineI18nUI` → `provider(locale)` for the
  `RootProvider` `i18n` prop (locale, language list + `displayName`, UI strings).
- `src/lib/source.ts` — the Fumadocs `loader` is given `i18n` **and a `slugs`
  fn**: a page whose frontmatter has `slug:` uses that as its URL, so a
  localized file can translate its slug (e.g. `/cs/zaciname`). The fn runs once
  per locale, so each language sets its own slug; omit `slug:` to inherit the
  filename-based one.
- `src/lib/translations.ts` — builds, at build time, a map from every page's
  URL to its counterpart URL in each locale. Translations are linked by
  **shared base filename with the locale stripped** (the "translation key"),
  _not_ by slug — so translated slugs still map to each other.
- `src/components/i18n-root-provider.tsx` — client wrapper around
  `RootProvider` that injects a slug-aware `onLocaleChange`. The default
  switcher just swaps the locale path segment, which 404s when slugs differ per
  language; ours looks the target up in the translation map (with a
  segment-swap fallback for pages not yet in the map).

Because the site is a **static export**, there is no Next.js middleware for
locale detection. Instead:

- Every locale carries an explicit URL prefix (`/en`, `/cs`).
- Each locale is pre-rendered via `generateStaticParams` (driven by
  `i18n.languages`).
- The bare root `/` is a tiny static page (`src/app/(root)/page.tsx`) that
  meta-refreshes to `/en`.

### Adding a language (e.g. Czech)

1. Add the code to `i18n.languages` in `src/lib/i18n.ts` (e.g. `['en', 'cs']`).
2. Add a `displayName` (and optional UI string translations) under that key
   in `src/lib/i18n-ui.ts`.
3. **Map the locale to an Orama tokenizer** in _both_
   `src/app/api/search/route.ts` (`localeMap`) and
   `src/components/search-dialog.tsx` (`ORAMA_LANGUAGE`). Orama ships no stemmer
   for some languages (Czech included) — map those to `'english'`. Skip this and
   the static build fails with `LANGUAGE_NOT_SUPPORTED`.
4. Add localized content files using the dot suffix, keeping the **same base
   filename** as the English file (the filename is the translation key):
   `index.mdx` (en) → `index.cs.mdx` (cs). Because `i18n.ts` sets
   `fallbackLanguage: null`, only translated pages exist under `/cs` — an
   untranslated page 404s there and is absent from the `/cs` sidebar (no
   English fallback). The switcher offers a language only where a real
   translation exists, so it never links to a missing `/cs` page.
5. **(SEO) Translate the URL** by adding `slug:` frontmatter to the localized
   file — e.g. `getting-started.cs.mdx` with `slug: zaciname` renders at
   `/cs/zaciname` instead of `/cs/getting-started`. Must be unique within the
   language; omit to keep the English slug. The switcher and sitemap pick it up
   automatically via the translation map.
6. The nav switcher populates automatically, and `<html lang>` already tracks
   the active locale (owned by the root layouts — see below). Nothing else to do.

## URL structure

The site lives at `docs.edustori.es`, so there is **no `/docs` prefix**. With
i18n, every page sits under a locale segment:

- `/` → static redirect to `/en`
- `/en`, `/cs` — docs home (from `content/docs/index.mdx` / `index.cs.mdx`)
- `/en/<page>` — pages within the docs

There is **no top-level `src/app/layout.tsx`**. Next.js only lets a _root_
layout render `<html>`/`<body>`, and a root layout can't read the `[lang]`
param — so the site uses **two root layouts** (the documented multiple-root
pattern) to give `<html lang>` the active locale. App-router files:

- `src/components/root-html.tsx` — the shared `<html lang={lang}>`/`<body>`
  shell (fonts, org JSON-LD). Both root layouts render it with their own `lang`.
- `src/lib/site-metadata.ts` — shared `metadata` + brand constants, exported by
  both root layouts.
- `src/app/(root)/layout.tsx` + `src/app/(root)/page.tsx` — root layout
  (`lang="en"`) and the `/` → `/en` static redirect.
- `src/app/[lang]/layout.tsx` — the localized root layout: renders
  `<RootHtml lang={lang}>` around `I18nRootProvider` (i18n provider + search).
- `src/app/[lang]/(docs)/layout.tsx` — Fumadocs `DocsLayout` (notebook),
  `tabs={false}` (no product switcher).
- `src/app/[lang]/(docs)/[[...slug]]/page.tsx` — catch-all docs page.
- `src/lib/source.ts` — Fumadocs source adapter (reads `content/docs/`) with the
  per-locale `slugs` fn.
- `src/lib/shared.ts` — `appName`, route constants, GitHub config.
- `src/lib/layout.shared.tsx` — base nav options (logo, links, language switch),
  takes the active `locale`.

Internal helper routes keep a `docs` segment for namespacing and are not
locale-segmented — they render one variant per page from the default-language
content: `/og/docs/[...slug]`, `/llms.mdx/docs/[[...slug]]`. Single-endpoint
routes: `/api/search` (its Orama index _is_ built per locale via `localeMap`),
`/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`.

## Content tree

```
content/docs/
├── index.mdx            # → /en   (Czech: index.cs.mdx → /cs)
├── meta.json            # section order (localize as meta.cs.json)
├── getting-started/
│   ├── index.mdx
│   ├── how-it-works.mdx
│   └── …
├── case-reports/        # incl. creating/ subfolder
├── training/  eduplay/  ai-assistant/  account/
└── vr.mdx
```

Localized files sit next to the English ones with the dot suffix and the
**same base filename** (`index.mdx` → `index.cs.mdx`); the filename is the
translation key (see the i18n section). Frontmatter is required (`title` +
`description`). Optional frontmatter:

- `slug:` — override the URL segment(s); set it on a localized file to
  translate the slug (see "Adding a language", step 5).
- `verifiedAt` (ISO `YYYY-MM-DD`) — drives the **"Verified <date>"** badge next
  to the Copy-Markdown / View-Options buttons, and is the strongest signal for
  `<lastmod>` in the sitemap.

See `source.config.ts` and `src/components/verified-badge.tsx`.

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
