import { RootHtml } from '@/components/root-html';
import { I18nRootProvider } from '@/components/i18n-root-provider';
import { provider } from '@/lib/i18n-ui';
import { i18n } from '@/lib/i18n';
import { getLocaleRuntime } from '@/lib/translations';
import { siteMetadata } from '@/lib/site-metadata';

// Root layout for the localized tree. Owns <html>/<body> so the `lang`
// attribute tracks the active locale (the shared, param-less root layout can't
// do this). See src/components/root-html.tsx.
export const metadata = siteMetadata;

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  return (
    <RootHtml lang={lang}>
      <I18nRootProvider i18n={provider(lang)} runtime={getLocaleRuntime()}>
        {children}
      </I18nRootProvider>
    </RootHtml>
  );
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
