import { source } from './source';
import { i18n } from './i18n';

// Slug-aware translation data for the language switcher, precomputed at build
// time. Two things the built-in switcher can't do on its own:
//
//  1. Navigate to a *translated slug*. Fumadocs links translations by filename
//     with the locale stripped (the "translation key"), NOT by URL slug, so
//     once `src/lib/source.ts` derives URLs from `slug:` frontmatter a page's
//     URL can differ per language (`/en/getting-started` ↔ `/cs/zaciname`).
//     `urls` maps every page URL to its counterpart URL in each locale.
//
//  2. Offer only languages that actually exist for a page. The switcher list is
//     global (`i18n.languages`), so it would advertise Čeština even on pages
//     with no `.cs.mdx`. `available` lists, per page, the locales with a *real*
//     translation so the client can filter the switcher. The English fallback
//     is kept (untranslated pages still resolve under `/cs`), it's just not
//     advertised.
export type LocaleRuntime = {
  // URL (no trailing slash) → { locale → that page's URL in `locale` }.
  urls: Record<string, Record<string, string>>;
  // URL (no trailing slash) → locales (in config order) with a real translation.
  available: Record<string, string[]>;
};

// Strip a locale suffix (`.cs`) that sits directly before the extension, so
// `getting-started.cs.mdx` and `getting-started.mdx` collapse to one shared
// key. Non-default languages carry the suffix; the default language never
// does — either way both sides reduce to the same key.
const localeSuffix = new RegExp(`\\.(${i18n.languages.join('|')})(\\.[^.]+)$`);
function translationKey(path: string): string {
  return path.replace(localeSuffix, '$2');
}

function normalizeUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

// A page is a *real* translation (vs. a default-language fallback) when it is
// the default language itself, or its file path still carries a locale suffix.
// Fallback pages are the inherited default-language files, so their paths have
// no suffix.
function isRealTranslation(language: string, path: string): boolean {
  return language === i18n.defaultLanguage || localeSuffix.test(path);
}

let cached: LocaleRuntime | undefined;

// Build (once per process) the runtime maps from every language's pages.
// `getLanguages()` yields each locale's full page set — including pages that
// fall back to the default language — so both untranslated navigation and the
// real-vs-fallback distinction are available here.
export function getLocaleRuntime(): LocaleRuntime {
  if (cached) return cached;

  // translation key → { locale → url } and → set of locales with a real file.
  const urlsByKey: Record<string, Record<string, string>> = {};
  const realByKey: Record<string, Set<string>> = {};
  for (const { language, pages } of source.getLanguages()) {
    for (const page of pages) {
      const key = translationKey(page.path);
      (urlsByKey[key] ??= {})[language] = normalizeUrl(page.url);
      if (isRealTranslation(language, page.path)) {
        (realByKey[key] ??= new Set()).add(language);
      }
    }
  }

  // Re-key by each page's own URL so the client can look up by pathname.
  const urls: LocaleRuntime['urls'] = {};
  const available: LocaleRuntime['available'] = {};
  for (const { pages } of source.getLanguages()) {
    for (const page of pages) {
      const key = translationKey(page.path);
      const url = normalizeUrl(page.url);
      urls[url] = urlsByKey[key];
      // Preserve configured language order; drop locales with no real file.
      available[url] = i18n.languages.filter((lang) =>
        realByKey[key]?.has(lang)
      );
    }
  }

  cached = { urls, available };
  return cached;
}
