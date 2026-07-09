'use client';

import { usePathname } from 'next/navigation';
import { RootProvider } from 'fumadocs-ui/provider/next';
import SearchDialog from '@/components/search-dialog';
import { i18n } from '@/lib/i18n';
import type { LocaleRuntime } from '@/lib/translations';

// Client wrapper around Fumadocs' `RootProvider` that makes the language
// switcher slug- and page-aware. `RootProvider` spreads its `i18n` prop into
// the internal `I18nProvider`, so we can override both the locale list and the
// change handler:
//
//  - `onLocaleChange`: the default swaps the locale path segment via a soft
//    router push. That breaks two ways here — translated slugs make the target
//    URL different, and a soft push re-renders `[lang]/layout.tsx` (which owns
//    <html>/<body> for the html-lang fix), which React 19 rejects because that
//    subtree contains an inline JSON-LD <script>. So we resolve the correct
//    translated URL from `runtime.urls` and do a **full navigation** — a locale
//    switch changes `<html lang>`, i.e. it is a new document, not an SPA
//    transition. Same-locale navigation stays soft (that layout isn't touched).
//  - `locales`: the default list is global, so it advertises every language on
//    every page. We filter it to `runtime.available` for the current page (plus
//    the current locale) so a language only appears where a real translation
//    exists.

const languages = new Set<string>(i18n.languages);

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

export function I18nRootProvider({
  i18n: i18nProvider,
  runtime,
  children,
}: {
  // The serialisable object returned by `provider(locale)` in i18n-ui.ts.
  i18n: React.ComponentProps<typeof RootProvider>['i18n'];
  runtime: LocaleRuntime;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = normalizePath(pathname);

  const onLocaleChange = (target: string) => {
    const translated = runtime.urls[current]?.[target];
    if (translated) {
      window.location.assign(translated);
      return;
    }

    // Fallback: mirror Fumadocs' default behaviour (swap the locale segment).
    const segments = pathname
      .split('/')
      .filter((segment) => segment.length > 0);
    if (segments.length === 0 || !languages.has(segments[0])) {
      segments.unshift(target);
    } else {
      segments[0] = target;
    }
    window.location.assign(`/${segments.join('/')}`);
  };

  // Show only languages with a real translation of this page, but always keep
  // the current locale so the switcher reflects where you are. Missing entry
  // (e.g. a page not in the map) falls back to the full, unfiltered list.
  const allowed = runtime.available[current];
  const baseLocales = i18nProvider?.locales ?? [];
  const locales = allowed
    ? baseLocales.filter(
        (item) =>
          allowed.includes(item.locale) || item.locale === i18nProvider?.locale
      )
    : baseLocales;

  return (
    <RootProvider
      i18n={{ ...i18nProvider, locales, onLocaleChange }}
      search={{
        // Custom dialog because the default one can't pass `initOrama`, which
        // we need to map our i18n locale codes to Orama language names.
        // See src/components/search-dialog.tsx.
        SearchDialog,
      }}
    >
      {children}
    </RootProvider>
  );
}
