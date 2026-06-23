import { defineI18nUI } from 'fumadocs-ui/i18n';
import { i18n } from './i18n';

// Fumadocs UI translations + display names per language. `provider(locale)`
// produces the `i18n` prop for `<RootProvider>` — it carries the locale,
// the list of selectable languages (shown in the nav language switcher),
// and the UI string translations for that locale.
//
// To add a language: add it to `i18n.languages`, give it a `displayName`
// here, and (optionally) translate the Fumadocs UI strings. See the
// Fumadocs docs for the full list of translatable keys.
export const { provider } = defineI18nUI(i18n, {
  translations: {
    en: { displayName: 'English' },
  },
});
