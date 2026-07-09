import { RootHtml } from '@/components/root-html';
import { siteMetadata } from '@/lib/site-metadata';

// Root layout for the bare `/` redirect. It is always English (the redirect
// points at the default locale), so `lang="en"` is correct here. The localized
// pages get their `lang` from src/app/[lang]/layout.tsx.
export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootHtml lang="en">{children}</RootHtml>;
}
