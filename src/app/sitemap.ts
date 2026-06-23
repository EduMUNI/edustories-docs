import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { gitLastmodForPage } from '@/lib/sitemap-lastmod';

export const dynamic = 'force-static';

const BASE_URL = 'https://docs.edustori.es';

// We deliberately do not emit <changefreq> or <priority>. Google has
// stated since at least 2017 (Gary Illyes, John Mueller, restated in
// 2023) that both are ignored. Bing follows the same line. Keeping
// them just adds noise — and an inaccurate priority undermines the
// trust mechanic Google applies to <lastmod>.
//
// `lastModified` precedence:
//   1. `verifiedAt` frontmatter — the human "checked against the
//      product" signal. Best signal for docs accuracy.
//   2. Git commit time of the page's MDX file — accurate for every
//      page even when nobody updated `verifiedAt`.
//   3. Omitted — when both above fail (e.g. file untracked, shallow
//      clone with no history). Better than lying.
export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => {
    const verifiedAt = page.data.verifiedAt;
    const verifiedDate = verifiedAt
      ? verifiedAt instanceof Date
        ? verifiedAt
        : new Date(verifiedAt)
      : null;
    const lastModified =
      verifiedDate ?? gitLastmodForPage(page.path) ?? undefined;

    return {
      url: `${BASE_URL}${page.url}`,
      lastModified,
    };
  });
}
