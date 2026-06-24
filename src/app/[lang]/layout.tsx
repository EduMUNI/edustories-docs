import { RootProvider } from 'fumadocs-ui/provider/next';
import { provider } from '@/lib/i18n-ui';
import { i18n } from '@/lib/i18n';
import SearchDialog from '@/components/search-dialog';

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  return (
    <RootProvider
      i18n={provider(lang)}
      search={{
        // Custom dialog because the default one can't pass `initOrama`, which
        // we need to map our i18n locale codes to Orama language names.
        // See src/components/search-dialog.tsx.
        SearchDialog,
      }}
    >
      {children}
    </RootProvider>
  );
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
