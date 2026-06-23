import { defineI18n } from 'fumadocs-core/i18n';

// Multilingual setup. English is the only shipped language today; the
// switcher and routing are wired so adding a language later is a small,
// mechanical step (see CLAUDE.md → "Adding a language").
//
// `hideLocale: 'never'` keeps an explicit locale prefix on every URL
// (`/en`, future `/cs`). We deliberately avoid the middleware-based
// `default-locale` mode because the site is a static export
// (`output: 'export'`), where Next.js middleware does not run — every
// locale is instead pre-rendered via `generateStaticParams`.
//
// `parser: 'dot'` means localized content lives next to the default file
// with a language suffix, e.g. `index.mdx` (en) + `index.cs.mdx` (cs).
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en'],
  hideLocale: 'never',
  parser: 'dot',
});
