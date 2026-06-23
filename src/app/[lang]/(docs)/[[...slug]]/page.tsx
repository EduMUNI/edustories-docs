import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { gitConfig } from '@/lib/shared';
import { gitLastmodForPage } from '@/lib/sitemap-lastmod';
import { VerifiedBadge } from '@/components/verified-badge';

const SITE_URL = 'https://docs.edustori.es';

export default async function Page(props: {
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`;
  // dateModified precedence matches the sitemap: human-curated
  // `verifiedAt` first (the strongest accuracy signal for docs), git
  // commit time of the MDX file as fallback, omitted if neither works.
  const verifiedAt = page.data.verifiedAt;
  const verifiedDate = verifiedAt
    ? verifiedAt instanceof Date
      ? verifiedAt
      : new Date(verifiedAt)
    : null;
  const lastModified =
    verifiedDate ?? gitLastmodForPage(page.path) ?? undefined;

  // Build a BreadcrumbList JSON-LD from the page's slug chain. Each
  // intermediate slug is looked up via source.getPage(prefix) so the
  // breadcrumb shows the actual page title ("LangSync") rather than
  // the slug ("langsync"). Position 1 is always the docs home; the
  // current page sits at the tail.
  const breadcrumbItems: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Docs',
      item: SITE_URL,
    },
  ];
  for (let i = 0; i < page.slugs.length - 1; i += 1) {
    const ancestor = source.getPage(page.slugs.slice(0, i + 1), params.lang);
    if (!ancestor) continue;
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: ancestor.data.title,
      item: `${SITE_URL}${ancestor.url}`,
    });
  }
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: page.data.title,
    item: `${SITE_URL}${page.url}`,
  });

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.data.title,
    description: page.data.description,
    url: `${SITE_URL}${page.url}`,
    isPartOf: { '@type': 'WebSite', name: 'Edustories Docs', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Edustories',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
    ...(lastModified && { dateModified: lastModified.toISOString() }),
  };

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        footer: (
          <div className="mt-6 flex">
            <EditOnGitHub
              href={githubUrl}
              className="text-fd-muted-foreground hover:text-fd-foreground inline-flex h-auto min-h-9 items-center gap-1.5 border-0 bg-transparent px-0.5 py-1 text-xs font-normal hover:bg-transparent hover:underline"
            />
          </div>
        ),
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row items-center gap-3 border-b pb-6">
        <MarkdownCopyButton
          markdownUrl={markdownUrl}
          className="text-fd-muted-foreground hover:text-fd-foreground data-[state=open]:text-fd-foreground -my-1 h-auto min-h-9 gap-1.5 border-0 bg-transparent px-0.5 py-1 text-xs font-normal hover:bg-transparent hover:underline data-[state=open]:bg-transparent"
        />
        <span aria-hidden className="bg-fd-border h-3 w-px" />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={githubUrl}
          className="text-fd-muted-foreground hover:text-fd-foreground data-[state=open]:text-fd-foreground -my-1 h-auto min-h-9 gap-1.5 border-0 bg-transparent px-0.5 py-1 text-xs font-normal hover:bg-transparent hover:underline data-[state=open]:bg-transparent"
        />
        <VerifiedBadge date={page.data.verifiedAt} className="ml-auto" />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string; slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const ogImage = getPageImage(page).url;
  const url = page.url;

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: page.data.title,
      description: page.data.description,
      url,
      siteName: 'Edustories Docs',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
      images: [ogImage],
    },
  };
}
