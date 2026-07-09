import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Static build: the Orama index is prerendered as a JSON file at build time
// and served from /api/search by Cloudflare Pages. The client downloads it
// once and runs search in the browser. See `src/app/layout.tsx`.
// With i18n, the index is built per locale. Fumadocs maps each locale to an
// Orama tokenizer; unmapped locales default to `getTokenizer(locale)`, which
// yields the locale's full language name and throws for languages Orama has no
// stemmer for. Czech is one of those, so map `cs` to the English tokenizer
// (search still works — it just skips Czech-specific stemming). Keep this in
// sync with ORAMA_LANGUAGE in src/components/search-dialog.tsx.
// https://docs.orama.com/docs/orama-js/supported-languages
export const { staticGET: GET } = createFromSource(source, {
  localeMap: {
    en: 'english',
    cs: 'english',
  },
});

export const revalidate = false;
