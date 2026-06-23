'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SidebarSearch() {
  const [q, setQ] = useState('');

  useEffect(() => {
    const sidebar = document.getElementById('nd-sidebar');
    if (!sidebar) return;

    const anchors = sidebar.querySelectorAll<HTMLAnchorElement>('a');
    // Section separators are bare <p> tags emitted by Fumadocs's
    // SidebarSeparator. Exclude <p> inside a button — ProductSwitcher
    // renders its title/description that way.
    const separators = Array.from(
      sidebar.querySelectorAll<HTMLParagraphElement>('p')
    ).filter((p) => !p.closest('button'));

    const reset = () => {
      sidebar.removeAttribute('data-filtering');
      anchors.forEach((a) => a.removeAttribute('data-filter-hidden'));
      separators.forEach((p) => p.removeAttribute('data-filter-hidden'));
    };

    const query = q.trim().toLowerCase();
    if (!query) {
      reset();
      return;
    }

    sidebar.setAttribute('data-filtering', '');

    const matches = Array.from(anchors).filter((a) =>
      (a.textContent || '').toLowerCase().includes(query)
    );

    // Walk up from every match and collect every ancestor element plus the
    // closest preceding <p> separator at each level. Everything in this set
    // stays visible; nothing else does.
    const visible = new Set<Element>();
    matches.forEach((a) => {
      let cur: Element | null = a;
      while (cur && cur !== sidebar) {
        visible.add(cur);
        let prev: Element | null = cur.previousElementSibling;
        while (prev) {
          if (prev.tagName === 'P' && !prev.closest('button')) {
            visible.add(prev);
            break;
          }
          prev = prev.previousElementSibling;
        }
        cur = cur.parentElement;
      }
    });

    anchors.forEach((a) => {
      // Folder-index links sit as a direct child of a Collapsible root that
      // contains a match. Keep them visible so the folder label shows.
      const isFolderIndexOfVisibleFolder =
        a.parentElement?.hasAttribute('data-state') &&
        visible.has(a.parentElement);
      if (visible.has(a) || isFolderIndexOfVisibleFolder) {
        a.removeAttribute('data-filter-hidden');
      } else {
        a.setAttribute('data-filter-hidden', '');
      }
    });

    separators.forEach((p) => {
      if (visible.has(p)) {
        p.removeAttribute('data-filter-hidden');
      } else {
        p.setAttribute('data-filter-hidden', '');
      }
    });

    return reset;
  }, [q]);

  return (
    <div className="relative">
      <Search className="text-fd-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter sidebar links..."
        className="bg-fd-background placeholder:text-fd-muted-foreground focus:ring-fd-ring/30 w-full rounded-md border py-1.5 pr-7 pl-8 text-sm focus:ring-2 focus:outline-none"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ('')}
          aria-label="Clear filter"
          className="text-fd-muted-foreground hover:text-fd-foreground absolute top-1/2 right-2 -translate-y-1/2"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
