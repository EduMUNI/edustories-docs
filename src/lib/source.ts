import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { i18n } from './i18n';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  i18n,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  // Per-locale URL slugs. The `slugs` fn runs once per language storage, so a
  // localized file can carry its own `slug:` frontmatter to translate the URL
  // (e.g. `getting-started.cs.mdx` → `/cs/zaciname`) while the shared filename
  // still links it to the English page as a translation. Returning `undefined`
  // falls back to the default filename-derived slug. `slugsFromData` is not
  // exported from fumadocs-core in 16.8, so this is spelled out inline.
  slugs: (file) => {
    const slug = (file.data as { slug?: unknown }).slug;
    if (typeof slug !== 'string') return undefined;
    return slug.split('/').filter((segment) => segment.length > 0);
  },
});

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
