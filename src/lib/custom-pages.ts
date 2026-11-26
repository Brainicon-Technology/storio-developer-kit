import { cache } from 'react';
import { storio, type StorioCustomPage } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { htmlToText } from '@/components/site/RichText';
import { safely, withDemoFallback, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/**
 * Pages the school creates itself in the dashboard (Custom Pages), served at /page/<slug>.
 *
 *   storio.getPages()          ->  StorioCustomPage[]       (all published pages: used by the sitemap)
 *   storio.getPageBySlug(slug) ->  StorioCustomPage | null
 *
 * `content` is either one HTML string (older pages) or a list of page-builder blocks
 * (StorioCustomPageSection[]), rendered by <CustomPageBlocks>. The whole page is school data:
 * no editor page, no pencils.
 */
export const loadCustomPage = cache(async function loadCustomPage(slug: string, ctx: TenantContext): Promise<StorioCustomPage | null> {
  const real = await safely(storio.getPageBySlug(slug, ctx.tenantHost));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.customPages.find((p) => p.slug === slug), ctx.isStandalone);
});

export async function loadCustomPages(ctx: TenantContext): Promise<StorioCustomPage[]> {
  const real = (await safely(storio.getPages(ctx.tenantHost)))?.filter((p) => p.is_published !== false) ?? null;
  return withDemoFallback(real, DEFAULT_DEMO_DATA.customPages, ctx.isStandalone);
}

/** Plain text of a page (its HTML, or its RichText blocks and hero text), for the meta description. */
export function customPageText(page: StorioCustomPage): string {
  if (typeof page.content === 'string') return htmlToText(page.content);
  return page.content
    .map((block) => (block.type === 'RichText' ? htmlToText(block.content) : block.type === 'Hero' ? (block.content.overlayText ?? '') : ''))
    .filter(Boolean)
    .join(' ');
}
