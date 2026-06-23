'use client';

import { SidebarSearch } from '@/components/sidebar-search';

/**
 * The sidebar's banner slot — a quick "filter sidebar links" box at the
 * top of the navigation. Lives in its own client-component module so the
 * (server-rendered) DocsLayout can pass it through Fumadocs's
 * function-form banner slot:
 *
 *   banner: SidebarBanner
 *
 * Why the function form: Fumadocs's notebook sidebar (see
 * node_modules/fumadocs-ui/.../notebook/slots/sidebar.js) renders
 * a ReactNode banner via `[props.children, banner]` — an unkeyed
 * children array that triggers React's "each child in a list
 * should have a unique key" dev warning. The function-form
 * branch goes through `createElement(banner, props)` with no
 * array wrap and no warning.
 */
export function SidebarBanner() {
  return (
    <div className="flex flex-col gap-2 p-4 pb-2">
      <SidebarSearch />
    </div>
  );
}
