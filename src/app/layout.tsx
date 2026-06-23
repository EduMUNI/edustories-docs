import './global.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

const SITE_NAME = 'Edustories Docs';
const SITE_URL = 'https://docs.edustori.es';
const SITE_DESCRIPTION =
  'Documentation for Edustories — the case-report platform for education: writing, AI-assisted extraction, collaboration, and export.';

export const metadata: Metadata = {
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Edustories',
  url: 'https://edustories.cz',
  logo: `${SITE_URL}/logo.svg`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The root layout owns <html>/<body> so that the static root redirect
  // page (src/app/page.tsx) produces valid HTML. Per-locale providers live
  // in src/app/[lang]/layout.tsx. With English the only language today,
  // lang="en" here is correct; when a second language ships, move the html
  // tag into the [lang] layout so the attribute tracks the active locale.
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans">{children}</body>
    </html>
  );
}
