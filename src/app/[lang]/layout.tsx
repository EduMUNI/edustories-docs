import { RootProvider } from 'fumadocs-ui/provider/next';
import { provider } from '@/lib/i18n-ui';
import { i18n } from '@/lib/i18n';

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
        options: {
          type: 'static',
          api: '/api/search',
        },
      }}
    >
      {children}
    </RootProvider>
  );
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
