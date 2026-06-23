'use client';

import { useSyncExternalStore } from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';

// formatRelative depends on Date.now() at evaluation time. Computing it
// during SSR would bake the relative string into the static HTML, so a
// build from days ago would still say "today". We defer the computation
// to the client via useSyncExternalStore – its getServerSnapshot returns
// null so SSR uses the absolute-date fallback, and getSnapshot recomputes
// from the visitor's wall clock on every client render.

function formatRelative(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'soon';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function formatAbsolute(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const noopSubscribe = () => () => {};

export function VerifiedBadge({
  date: input,
  className,
}: {
  date?: string | Date;
  className?: string;
}) {
  const relative = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (input === undefined || input === null || input === '') return null;
      const date = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(date.getTime())) return null;
      return formatRelative(date);
    },
    () => null
  );

  if (input === undefined || input === null || input === '') {
    return (
      <div
        className={`text-fd-muted-foreground inline-flex items-center gap-1.5 text-xs ${className ?? ''}`}
        title="This page has not been verified against the live product yet"
      >
        <CircleDashed className="size-4" strokeWidth={2.5} />
        <span className="font-medium">Not verified yet</span>
      </div>
    );
  }

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;

  const absolute = formatAbsolute(date);

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs ${className ?? ''}`}
      title={`Verified on ${absolute}`}
    >
      <CheckCircle2
        className="size-4 text-emerald-600 dark:text-emerald-500"
        strokeWidth={2.5}
      />
      <span className="text-fd-foreground/85 font-medium">
        <span className="max-sm:hidden">Verified </span>
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
