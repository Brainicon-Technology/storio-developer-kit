import { cache } from 'react';
import { storio, type StorioCustomPage } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/**
 * Pages the school creates itself in the dashboard (Custom Pages), served at /page/<slug>.
 * The whole page is school data, so it has no editor page and no pencils.
 */
export const loadCustomPage = cache(async function loadCustomPage(slug: string, ctx: TenantContext): Promise<StorioCustomPage | null> {
  const real = await safely(storio.getPageBySlug(slug, ctx.tenantHost));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.customPages.find((p) => p.slug === slug), ctx.isStandalone);
});

/**
 * A custom page's content is either one HTML string or a list of page-builder blocks.
 * Blocks are turned into HTML from their common text fields; unknown block types are skipped.
 */
export function customPageHtml(page: StorioCustomPage): string {
  if (typeof page.content === 'string') return page.content;
  if (!Array.isArray(page.content)) return '';
  return page.content
    .map((block) => {
      const html = block.html ?? block.content;
      if (typeof html === 'string') return html;
      const text = block.text;
      if (typeof text !== 'string') return '';
      const safe = text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] ?? c);
      return block.type === 'heading' ? `<h2>${safe}</h2>` : `<p>${safe}</p>`;
    })
    .join('');
}
