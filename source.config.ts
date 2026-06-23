import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      // ISO date (YYYY-MM-DD) – the date a human last verified this page
      // against the actual product. Surfaces as a "Verified <date>" badge
      // next to the Copy Markdown / Open buttons. Accepts both a string
      // and a Date because YAML auto-parses bare YYYY-MM-DD into Date.
      verifiedAt: z.union([z.string(), z.date()]).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
