import type { Metadata } from 'next';

import { getPageMetadata } from '@/lib/storio-editor/server';
import { cms } from '@/cms.config';
import { serverCmsStorage } from './cms-server-storage';
import { loadLayout } from './site';
import { resolveTenant } from './tenant';

/**
 * SEO helpers.
 *
 * - Site-wide: the school's name and tagline (its settings, SDK) give the title template and the
 *   default description.
 * - Per page: the page's "seo" section (title, description, keywords, share image), editable in the
 *   Storio editor. Empty fields keep the fallback.
 */

/** Root layout metadata: "<page> | <school name>", default description, favicon. */
export async function siteMetadata(fallbackTitle: string): Promise<Metadata> {
  const { settings } = await loadLayout(await resolveTenant());
  const siteName = settings?.site_title || fallbackTitle;
  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: settings?.site_tagline || undefined,
    icons: settings?.favicon_url ? { icon: settings.favicon_url } : undefined,
  };
}

/** A page's metadata from its "seo" section. */
export async function pageMetadata(pageKey: string, fallback: Metadata = {}): Promise<Metadata> {
  try {
    return await getPageMetadata(cms, pageKey, { storage: await serverCmsStorage(), fallback, site: false });
  } catch {
    return fallback;
  }
}
