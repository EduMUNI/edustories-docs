import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { SidebarBanner } from '@/components/sidebar-banner';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  const base = baseOptions(lang);
  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      sidebar={{
        // SidebarBanner is a client component; passing the
        // reference (not an invocation) takes Fumadocs's
        // function-form branch in notebook/slots/sidebar.js,
        // which renders via `createElement(banner, props)` and
        // skips the unkeyed-children-array wrap that the
        // ReactNode form falls into.
        banner: SidebarBanner,
      }}
      tabs={false}
      {...base}
      nav={{ ...base.nav, mode: 'top' }}
    >
      {children}
    </DocsLayout>
  );
}
