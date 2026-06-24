'use client';

import { create } from '@orama/orama';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search';
import type { SharedProps } from 'fumadocs-ui/contexts/search';

// The static Orama index is built per-locale on the server, where Fumadocs
// maps each i18n locale to Orama's full language name (e.g. `en` → `english`,
// see createI18nSearchAPI/getTokenizer). The default client dialog skips that
// mapping: it calls `create({ language: locale })` with the raw locale code,
// and Orama only accepts full names — so `create({ language: 'en' })` throws
// "Language 'en' is not supported.", the load rejects, and every query returns
// zero results with nothing logged. We rebuild the dialog with an `initOrama`
// that maps locale → Orama language so the query tokenizer matches the index.
const ORAMA_LANGUAGE: Record<string, string> = {
  en: 'english',
};

function initOrama(locale?: string) {
  return create({
    schema: { _: 'string' },
    language: (locale && ORAMA_LANGUAGE[locale]) || 'english',
  });
}

// Mirrors Fumadocs's DefaultSearchDialog, but pins the static client and passes
// `initOrama`. The default dialog drops `initOrama` (it never forwards it to
// useDocsSearch), so overriding the dialog is the only way to inject it.
export default function CustomSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const { search, setSearch, query } = useDocsSearch({
    type: 'static',
    from: '/api/search',
    initOrama,
    locale,
  });

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
