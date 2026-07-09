import { defineI18nUI } from 'fumadocs-ui/i18n';
import { i18n } from './i18n';

// Fumadocs UI translations + display names per language. `provider(locale)`
// produces the `i18n` prop for `<RootProvider>` — it carries the locale,
// the list of selectable languages (shown in the nav language switcher),
// and the UI string translations for that locale.
//
// To add a language: add it to `i18n.languages`, give it a `displayName`
// here, and translate the Fumadocs UI strings below. English (the default
// language) needs only `displayName` — Fumadocs falls back to its built-in
// English `defaultTranslations` for anything omitted.
//
// The full key set (search, toc, nav, GitHub link, theme/language pickers) is
// the `Translations` interface in fumadocs-ui/contexts/i18n. Custom strings
// outside this set are localized in their own components (e.g. the sidebar
// filter box in src/components/sidebar-search.tsx, the "Visit website" nav
// link in src/lib/layout.shared.tsx).
export const { provider } = defineI18nUI(i18n, {
  translations: {
    en: { displayName: 'English' },
    cs: {
      displayName: 'Čeština',
      search: 'Hledat',
      searchNoResult: 'Nenalezeny žádné výsledky',
      toc: 'Na této stránce',
      tocNoHeadings: 'Žádné nadpisy',
      lastUpdate: 'Naposledy aktualizováno',
      chooseLanguage: 'Vyberte jazyk',
      nextPage: 'Další stránka',
      previousPage: 'Předchozí stránka',
      chooseTheme: 'Motiv',
      editOnGithub: 'Upravit na GitHubu',
    },
  },
});
