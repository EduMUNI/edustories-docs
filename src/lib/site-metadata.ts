import type { Metadata } from 'next';

// Shared site metadata + brand constants. Lives outside the route tree so both
// root layouts (src/app/(root)/layout.tsx and src/app/[lang]/layout.tsx) can
// export the same `metadata` without duplication.
export const SITE_NAME = 'Edustories Docs';
export const SITE_URL = 'https://docs.edustori.es';
export const SITE_DESCRIPTION =
  'Documentation for Edustories — the case-report platform for education: writing, AI-assisted extraction, collaboration, and export.';

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: '%s — Edustories',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'Edustories', url: 'https://edustories.cz' }],
  keywords: ['Edustories', 'documentation', 'case reports', 'education'],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
  },
};

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Edustories',
  url: 'https://edustories.cz',
  logo: `${SITE_URL}/logo.svg`,
};
