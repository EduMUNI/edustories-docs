import type { Metadata } from 'next';

// The site is a static export, so there is no middleware to redirect the
// bare root to the default locale. We emit a tiny static page that
// meta-refreshes to `/en` (and offers a manual link as a fallback). When
// more locales exist this is still correct: the default language wins.
const TARGET = '/en';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
      <main className="m-auto p-8 text-center text-sm">
        Redirecting to{' '}
        <a className="text-fd-primary underline" href={TARGET}>
          the documentation
        </a>
        …
      </main>
    </>
  );
}
