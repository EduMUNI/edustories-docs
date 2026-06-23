import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Static build: the Orama index is prerendered as a JSON file at build time
// and served from /api/search by Cloudflare Pages. The client downloads it
// once and runs search in the browser. See `src/app/layout.tsx`.
export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

export const revalidate = false;
