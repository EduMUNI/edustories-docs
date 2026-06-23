// Build-time helper: resolve `<lastmod>` for a Fumadocs page from the git
// history of its source MDX file. Saves us from "every page shows today"
// when Cloudflare Pages does a shallow clone and from "most pages have no
// lastmod" because `verifiedAt` frontmatter isn't always filled in.
//
// Strategy: take the page's virtualized path (relative to content/), join
// with the content dir, ask git for the last commit's ISO timestamp.
// Cache so we never fork the same git subprocess twice per build.
//
// On failure (git missing, file untracked, shallow clone with no history)
// we return null — better than a wrong date for the trust mechanic.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const CONTENT_DIR = path.join(repoRoot, 'content/docs');

const cache = new Map<string, string | null>();

export function gitLastmodForPage(pagePath: string): Date | null {
  // page.path is e.g. "langsync/getting-started.mdx" — relative to content/docs.
  // Tolerate a leading slash just in case.
  const rel = pagePath.replace(/^\/+/, '');
  const absPath = path.join(CONTENT_DIR, rel);

  const cached = cache.get(absPath);
  if (cached !== undefined) {
    return cached ? new Date(cached) : null;
  }

  if (!existsSync(absPath)) {
    cache.set(absPath, null);
    return null;
  }

  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', absPath],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    ).trim();
    const value = out || null;
    cache.set(absPath, value);
    return value ? new Date(value) : null;
  } catch {
    cache.set(absPath, null);
    return null;
  }
}
