import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ExternalLink } from 'lucide-react';
import { appName, gitConfig } from './shared';
import { i18n } from './i18n';

function ExternalLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <ExternalLink className="size-3 opacity-70" />
    </span>
  );
}

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    // `i18n` makes the language switcher appear in the nav. With a single
    // language it lists only English; adding a language to `i18n.languages`
    // populates it automatically.
    i18n,
    nav: {
      // Clicking the logo returns to the current locale's home (`/en`).
      url: `/${locale}`,
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-horizontal.svg"
            alt={appName}
            className="h-7 w-auto dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-horizontal-dark.svg"
            alt={appName}
            className="hidden h-7 w-auto dark:block"
          />
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        type: 'main',
        text: <ExternalLabel>Visit website</ExternalLabel>,
        url: 'https://edustories.cz',
        external: true,
      },
    ],
    searchToggle: {
      enabled: true,
      full: {
        className: 'my-auto h-9 w-full max-w-md max-md:hidden bg-transparent',
      },
    },
  };
}
