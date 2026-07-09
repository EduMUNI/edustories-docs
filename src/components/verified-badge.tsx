'use client';

import { useSyncExternalStore } from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';

// formatRelative depends on Date.now() at evaluation time. Computing it
// during SSR would bake the relative string into the static HTML, so a
// build from days ago would still say "today". We defer the computation
// to the client via useSyncExternalStore – its getServerSnapshot returns
// null so SSR uses the absolute-date fallback, and getSnapshot recomputes
// from the visitor's wall clock on every client render.

// The badge is locale-aware: dates and relative phrasing follow the active
// language (passed as `lang`). Map our i18n locale codes to BCP 47 tags for
// Intl; the UI labels come from LABELS. Both fall back to English.
const BCP47: Record<string, string> = {
  en: 'en-US',
  cs: 'cs-CZ',
};

const LABELS: Record<
  string,
  {
    verified: string;
    notVerified: string;
    notVerifiedTitle: string;
    verifiedOn: (date: string) => string;
  }
> = {
  en: {
    verified: 'Verified',
    notVerified: 'Not verified yet',
    notVerifiedTitle:
      'This page has not been verified against the live product yet',
    verifiedOn: (date) => `Verified on ${date}`,
  },
  cs: {
    verified: 'Ověřeno',
    notVerified: 'Zatím neověřeno',
    notVerifiedTitle:
      'Tato stránka zatím nebyla ověřena oproti aktuální verzi produktu',
    verifiedOn: (date) => `Ověřeno ${date}`,
  },
};

function localeTag(lang?: string): string {
  return (lang && BCP47[lang]) || BCP47.en;
}

function labelsFor(lang?: string) {
  return (lang && LABELS[lang]) || LABELS.en;
}

const DAY_MS = 1000 * 60 * 60 * 24;

// Locale-aware relative date. `Intl.RelativeTimeFormat` with `numeric: 'auto'`
// yields "today" / "yesterday" / "3 days ago" — or their translations
// ("dnes" / "včera" / "před 3 dny") — so no hand-maintained English strings.
function formatRelative(date: Date, lang?: string): string {
  const rtf = new Intl.RelativeTimeFormat(localeTag(lang), {
    numeric: 'auto',
  });
  const diffDays = Math.floor((Date.now() - date.getTime()) / DAY_MS);
  const abs = Math.abs(diffDays);
  // A past date has diffDays > 0; negate so RelativeTimeFormat says "ago".
  if (abs === 0) return rtf.format(0, 'day');
  if (abs < 7) return rtf.format(-diffDays, 'day');
  if (abs < 30) return rtf.format(-Math.round(diffDays / 7), 'week');
  if (abs < 365) return rtf.format(-Math.round(diffDays / 30), 'month');
  return rtf.format(-Math.round(diffDays / 365), 'year');
}

function formatAbsolute(date: Date, lang?: string): string {
  return date.toLocaleDateString(localeTag(lang), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const noopSubscribe = () => () => {};

export function VerifiedBadge({
  date: input,
  lang,
  className,
}: {
  date?: string | Date;
  lang?: string;
  className?: string;
}) {
  const relative = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (input === undefined || input === null || input === '') return null;
      const date = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(date.getTime())) return null;
      return formatRelative(date, lang);
    },
    () => null
  );

  const labels = labelsFor(lang);

  if (input === undefined || input === null || input === '') {
    return (
      <div
        className={`text-fd-muted-foreground inline-flex items-center gap-1.5 text-xs ${className ?? ''}`}
        title={labels.notVerifiedTitle}
      >
        <CircleDashed className="size-4" strokeWidth={2.5} />
        <span className="font-medium">{labels.notVerified}</span>
      </div>
    );
  }

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;

  const absolute = formatAbsolute(date, lang);

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs ${className ?? ''}`}
      title={labels.verifiedOn(absolute)}
    >
      <CheckCircle2
        className="size-4 text-emerald-600 dark:text-emerald-500"
        strokeWidth={2.5}
      />
      <span className="text-fd-foreground/85 font-medium">
        <span className="max-sm:hidden">{labels.verified} </span>
        {relative ?? absolute}
      </span>
      {relative && (
        <span aria-hidden className="text-fd-muted-foreground/60 max-md:hidden">
          · {absolute}
        </span>
      )}
    </div>
  );
}
