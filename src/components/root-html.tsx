import '@/app/global.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { organizationJsonLd } from '@/lib/site-metadata';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

// The shared <html>/<body> shell. Next.js only lets a *root* layout render
// these tags, and a root layout can't read the `[lang]` route param — so the
// shell is factored out here and each root layout supplies its own `lang`:
// the `/` redirect (src/app/(root)/layout.tsx) passes 'en', and the localized
// tree (src/app/[lang]/layout.tsx) passes the active locale. This is why there
// is no top-level src/app/layout.tsx: multiple root layouts require removing it.
export function RootHtml({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={lang}
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans">
        {/* JSON-LD rendered in the body per the Next.js App Router pattern
            (crawlers read it anywhere in the document); avoids a manual
            <head>, which the metadata API is meant to own. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
