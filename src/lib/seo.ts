import type { Metadata } from 'next';
import type { StorioSettingsResponse } from '@storio/template-sdk';

import { getPageMetadata } from '@/lib/storio-editor/server';
import { cms } from '@/cms.config';
import { serverCmsStorage } from './cms-server-storage';
import { mediaUrl } from './normalize';
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

/**
 * The favicon the school uploaded in the dashboard (Settings > favicon).
 *
 *   storio.getLayout().settings.favicon_url  (or storio.getSettings().favicon_url)  ->  string, "" when not set
 *
 * School data, so it gets no editor pencil. When it's empty, public/favicon.ico (the template's own) is used.
 * Keep the template's icon in public/, not as src/app/favicon.ico: Next.js puts a favicon file in
 * src/app/ ahead of metadata `icons`, so the school's favicon would never show.
 */
export function faviconUrl(settings: StorioSettingsResponse | null): string {
  return mediaUrl(settings?.favicon_url) ?? DEFAULT_FAVICON;
}

const DEFAULT_FAVICON = '/favicon.ico';

/** Root layout metadata: "<page> | <school name>", default description, favicon. */
export async function siteMetadata(fallbackTitle: string): Promise<Metadata> {
  const { settings } = await loadLayout(await resolveTenant());
  const siteName = settings?.site_title || fallbackTitle;
  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: settings?.site_tagline || undefined,
    icons: { icon: faviconUrl(settings) },
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
