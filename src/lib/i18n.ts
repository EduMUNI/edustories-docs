import { defineI18n } from 'fumadocs-core/i18n';

// Multilingual setup. English is the default, complete language; Czech (`cs`)
// is being translated page by page (see CLAUDE.md → "Adding a language").
//
// `hideLocale: 'never'` keeps an explicit locale prefix on every URL
// (`/en`, `/cs`). We deliberately avoid the middleware-based `default-locale`
// mode because the site is a static export (`output: 'export'`), where Next.js
// middleware does not run — every locale is pre-rendered via
// `generateStaticParams`.
//
// `parser: 'dot'` means localized content lives next to the default file with a
// language suffix, e.g. `index.mdx` (en) + `index.cs.mdx` (cs).
//
// `fallbackLanguage: null` disables the English fallback: a page with no
// `.cs.mdx` does NOT exist under `/cs` (the URL 404s) and does not appear in
// the `/cs` sidebar — the localized tree lists only pages that are actually
// translated. This is the intentional choice here: `/cs` is a pure Czech
// surface, not English-with-gaps. (The default — omitting this — would instead
// fall back to English content for untranslated pages.)
//
// The language switcher is independently filtered per page
// (src/lib/translations.ts + src/components/i18n-root-provider.tsx): it only
// offers a language that has a real translation of the current page, so with
// `null` it never links to a `/cs` URL that doesn't exist.
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'cs'],
  hideLocale: 'never',
  parser: 'dot',
  fallbackLanguage: null,
});
