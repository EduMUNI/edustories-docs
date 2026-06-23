'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Fumadocs renders each sidebar folder as a Radix Collapsible, and
// CollapsibleContent UNMOUNTS its children while the folder is closed. So a
// plain `#nd-sidebar a` filter can only see links inside folders that are
// already open. To make filtering work across the whole tree we expand any
// collapsed folder while a query is active (then collapse the ones we opened
// again when the query is cleared).

// The clickable toggle for a collapsible folder root: a folder with an index
// page renders a link whose chevron ([data-icon]) toggles it; a folder
// without one renders a <button> trigger.
function folderToggle(root: Element): HTMLElement | null {
  return (
    root.querySelector<HTMLElement>(':scope > button') ??
    root.querySelector<HTMLElement>(':scope > a [data-icon]')
  );
}

// A collapsible root counts as a "folder" only if it directly contains its
// toggle — this excludes other Radix elements that also carry data-state
// (e.g. scroll-area scrollbars).
function isFolderRoot(el: Element): boolean {
  return !!el.querySelector(':scope > a, :scope > button');
}

export function SidebarSearch() {
  const [q, setQ] = useState('');
  // Folders we expanded ourselves, so we can restore them on clear.
  const autoOpened = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const sidebar = document.getElementById('nd-sidebar');
    if (!sidebar) return;

    const query = q.trim().toLowerCase();

    const clearHidden = () => {
      sidebar
        .querySelectorAll('[data-filter-hidden]')
        .forEach((el) => el.removeAttribute('data-filter-hidden'));
    };

    const collapseAutoOpened = () => {
      // Closing a parent unmounts its descendants, so just toggle whatever is
      // still open; descendants we opened will already be gone.
      autoOpened.current.forEach((root) => {
        if (root.isConnected && root.getAttribute('data-state') === 'open') {
          folderToggle(root)?.click();
        }
      });
      autoOpened.current.clear();
    };

    if (!query) {
      sidebar.removeAttribute('data-filtering');
      clearHidden();
      collapseAutoOpened();
      return;
    }

    sidebar.setAttribute('data-filtering', '');

    // Expand every currently-closed folder so its links mount and become
    // filterable. Returns whether it opened anything this pass.
    const expandClosedFolders = (): boolean => {
      let openedAny = false;
      sidebar.querySelectorAll('[data-state="closed"]').forEach((root) => {
        if (!isFolderRoot(root)) return;
        const toggle = folderToggle(root);
        if (!toggle) return;
        autoOpened.current.add(root);
        toggle.click();
        openedAny = true;
      });
      return openedAny;
    };

    const applyFilter = () => {
      const anchors = Array.from(
        sidebar.querySelectorAll<HTMLAnchorElement>('a')
      );
      // Section separators are bare <p> tags emitted by Fumadocs's
      // SidebarSeparator. Exclude <p> inside a button just in case.
      const separators = Array.from(
        sidebar.querySelectorAll<HTMLParagraphElement>('p')
      ).filter((p) => !p.closest('button'));

      const matches = anchors.filter((a) =>
        (a.textContent || '').toLowerCase().includes(query)
      );

      // Everything from a match up to the sidebar root stays visible, plus the
      // nearest preceding <p> separator at each level.
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
        // A folder's own link is a sibling of its content, so it never appears
        // in the walk-up. Keep it when its collapsible root is visible.
        const isFolderLinkOfVisibleFolder =
          a.parentElement?.hasAttribute('data-state') &&
          visible.has(a.parentElement);
        if (visible.has(a) || isFolderLinkOfVisibleFolder) {
          a.removeAttribute('data-filter-hidden');
        } else {
          a.setAttribute('data-filter-hidden', '');
        }
      });

      separators.forEach((p) => {
        if (visible.has(p)) p.removeAttribute('data-filter-hidden');
        else p.setAttribute('data-filter-hidden', '');
      });

      // Hide whole folders that contain no match, so we don't leave empty
      // collapsible shells (and their spacing) behind.
      sidebar.querySelectorAll('[data-state]').forEach((root) => {
        if (!isFolderRoot(root)) return;
        if (visible.has(root)) root.removeAttribute('data-filter-hidden');
        else root.setAttribute('data-filter-hidden', '');
      });
    };

    expandClosedFolders();
    applyFilter();

    // Expanding mounts content asynchronously and can reveal further nested
    // closed folders; keep expanding + re-filtering until the tree settles.
    // (We only observe childList, so the attribute writes above don't loop.)
    const observer = new MutationObserver(() => {
      expandClosedFolders();
      applyFilter();
    });
    observer.observe(sidebar, { childList: true, subtree: true });

    return () => observer.disconnect();
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
