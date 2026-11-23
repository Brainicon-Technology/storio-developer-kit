import type { Metadata } from 'next';
import { getPageContent, getPageMetadata, getSiteMetadata } from '@brainicon/storio-elements-editor/next';

import { cmsPages } from '@/cms/pages';
import type siteDefaults from '@/content/site.json';
import { getCmsStorage } from './cms-storage';

/**
 * SEO helpers.
 *
 * The site-wide SEO section is called "siteSeo", not "seo": defineCms does not allow
 * the same section key on a page and on the global page, and every page has its own
 * "seo" section. (storio-elements-editor v1.3.4 reads the global "seo" section in
 * getPageMetadata, so we pass the site defaults as the fallback ourselves.)
 */

const SITE_SEO_SECTION = 'siteSeo';

type SiteSeo = (typeof siteDefaults)['siteSeo'];

/** Root layout metadata: title template, default description, share image, favicon. */
export async function siteMetadata(fallback: Metadata): Promise<Metadata> {
  return getSiteMetadata({ pages: cmsPages }, { storage: await getCmsStorage(), section: SITE_SEO_SECTION, fallback });
}

/** A page's metadata from its "seo" section. Empty fields fall back to the site SEO. */
export async function pageMetadata(pageKey: string): Promise<Metadata> {
  const storage = await getCmsStorage();
  const site = await getPageContent<Record<string, unknown>>({ pages: cmsPages }, 'site', { storage });
  const siteSeo = site[SITE_SEO_SECTION] as SiteSeo | undefined;

  const fallback: Metadata = {
    description: siteSeo?.description || undefined,
    openGraph: siteSeo?.ogImage ? { images: [siteSeo.ogImage] } : undefined,
  };

  return getPageMetadata({ pages: cmsPages }, pageKey, { storage, site: false, fallback });
}
