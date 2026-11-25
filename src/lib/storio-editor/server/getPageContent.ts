import type { Metadata } from 'next';
import type { CmsConfig, CmsStorageAdapter } from '../core/types';
import { findGlobalPage, findPage } from '../core/defineCms';
import { mergePageContent } from '../core/merge';

/** Shape of the optional "seo" section a page can define in its defaults. */
export interface PageSeoConfig {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  /** e.g. "index, follow" or "noindex, nofollow". */
  robots?: string;
}

/** Shape of the optional "seo" section of the global page: site-wide defaults. */
export interface SiteSeoConfig extends PageSeoConfig {
  /** Site name, e.g. "Brainicon". Used for og:site_name and as the title when a page has none. */
  siteName?: string;
  /** Title of every page, with %s for the page title, e.g. "%s | Brainicon". */
  titleTemplate?: string;
  /** Favicon URL, e.g. "/favicon.ico". */
  favicon?: string;
}

/**
 * Load a page's published content on the server (Server Components,
 * generateMetadata, getServerSideProps). Falls back to the page defaults when
 * storage is unreachable, so a storage outage never breaks rendering.
 */
export async function getPageContent<T = Record<string, unknown>>(
  config: Pick<CmsConfig, 'pages'>,
  pageKey: string,
  options: { storage: CmsStorageAdapter; includeDrafts?: boolean }
): Promise<T> {
  const page = findPage(config, pageKey);
  if (!page) throw new Error(`[storio-editor] Unknown page "${pageKey}".`);
  try {
    const records = await options.storage.listRecords(pageKey, { includeDrafts: options.includeDrafts });
    return mergePageContent<T>(page, records, { includeDrafts: options.includeDrafts });
  } catch {
    return mergePageContent<T>(page, []);
  }
}

/**
 * Load the published content of every page in the config, keyed by page key, ready
 * for `<CmsProvider initialContent={...}>`. With it, the server-rendered HTML already
 * contains the edited text (good for SEO, no flash of default content). Pages whose
 * storage cannot be reached fall back to their defaults.
 */
export async function getAllPageContent(
  config: Pick<CmsConfig, 'pages'>,
  options: { storage: CmsStorageAdapter }
): Promise<Record<string, Record<string, unknown>>> {
  const entries = await Promise.all(
    config.pages.map(async (page) => [page.key, await getPageContent<Record<string, unknown>>(config, page.key, options)] as const)
  );
  return Object.fromEntries(entries);
}

/** Build Next.js metadata from a page's editable "seo" section, on top of a fallback. */
export function buildPageMetadata(content: { seo?: PageSeoConfig } | Record<string, unknown>, fallback: Metadata = {}): Metadata {
  const seo = (content as { seo?: PageSeoConfig }).seo;
  if (!seo || typeof seo !== 'object') return fallback;

  const keywords = Array.isArray(seo.keywords)
    ? seo.keywords
    : typeof seo.keywords === 'string'
      ? seo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : fallback.keywords;

  // "noindex" contains "index", so test for the negative forms explicitly.
  const robots = (seo.robots ?? '').toLowerCase();
  const index = !/\bnoindex\b/.test(robots);
  const follow = !/\bnofollow\b/.test(robots);
  const fallbackTitle = typeof fallback.title === 'string' ? fallback.title : undefined;

  return {
    ...fallback,
    title: seo.title || fallback.title,
    description: seo.description || fallback.description,
    keywords,
    alternates: seo.canonical ? { ...fallback.alternates, canonical: seo.canonical } : fallback.alternates,
    openGraph: {
      ...fallback.openGraph,
      title: seo.ogTitle || seo.title || fallbackTitle,
      description: seo.ogDescription || seo.description || fallback.description || undefined,
      url: seo.canonical || (fallback.openGraph?.url as string | undefined),
      images: seo.ogImage ? [{ url: seo.ogImage }] : fallback.openGraph?.images,
    },
    twitter: {
      ...fallback.twitter,
      card: seo.twitterCard || 'summary_large_image',
      title: seo.ogTitle || seo.title || fallbackTitle,
      description: seo.ogDescription || seo.description || fallback.description || undefined,
      images: seo.ogImage ? [seo.ogImage] : fallback.twitter?.images,
    },
    robots: seo.robots ? { index, follow } : fallback.robots,
  };
}

/**
 * Build the site-wide metadata for the root layout from the global page's "seo" section:
 * a title template, the default description and share image, og:site_name and the favicon.
 */
export function buildSiteMetadata(seo: SiteSeoConfig | undefined, fallback: Metadata = {}): Metadata {
  if (!seo || typeof seo !== 'object') return fallback;
  const page = buildPageMetadata({ seo }, fallback);
  const defaultTitle = seo.title || seo.siteName || (typeof fallback.title === 'string' ? fallback.title : undefined);
  const template = seo.titleTemplate && seo.titleTemplate.includes('%s') ? seo.titleTemplate : undefined;
  return {
    ...page,
    title: template && defaultTitle ? { default: defaultTitle, template } : defaultTitle ?? fallback.title,
    openGraph: {
      ...page.openGraph,
      title: seo.ogTitle || defaultTitle,
      siteName: seo.siteName || (fallback.openGraph?.siteName as string | undefined),
    },
    twitter: { ...page.twitter, title: seo.ogTitle || defaultTitle },
    icons: seo.favicon ? { icon: seo.favicon } : fallback.icons,
  };
}

/**
 * For `generateMetadata` in the root layout: the site-wide metadata from the global page
 * (the page with `global: true`). Without a global page it returns `fallback`.
 */
export async function getSiteMetadata(
  config: Pick<CmsConfig, 'pages'>,
  options: { storage: CmsStorageAdapter; fallback?: Metadata; section?: string }
): Promise<Metadata> {
  const globalPage = findGlobalPage(config);
  if (!globalPage) return options.fallback ?? {};
  const content = await getPageContent<Record<string, unknown>>(config, globalPage.key, { storage: options.storage });
  return buildSiteMetadata(content[options.section ?? 'seo'] as SiteSeoConfig | undefined, options.fallback);
}

/**
 * Convenience for `generateMetadata`: load the page and build its metadata. When the config has
 * a global page, its "seo" section fills what the page leaves empty (description, share image),
 * so a page without SEO of its own still gets the site defaults. Pass `site: false` to skip that.
 */
export async function getPageMetadata(
  config: Pick<CmsConfig, 'pages'>,
  pageKey: string,
  options: { storage: CmsStorageAdapter; fallback?: Metadata; site?: boolean }
): Promise<Metadata> {
  const content = await getPageContent<Record<string, unknown>>(config, pageKey, { storage: options.storage });
  let fallback = options.fallback ?? {};
  const globalPage = options.site === false ? undefined : findGlobalPage(config);
  if (globalPage && globalPage.key !== pageKey) {
    const site = await getPageContent<Record<string, unknown>>(config, globalPage.key, { storage: options.storage });
    fallback = mergeSiteFallback(site.seo as SiteSeoConfig | undefined, fallback);
  }
  return buildPageMetadata(content, fallback);
}

/**
 * Site SEO under a page's own fallback. The title is left out on purpose: the root layout's
 * title template already supplies the default title, and repeating it would show it twice.
 */
function mergeSiteFallback(seo: SiteSeoConfig | undefined, fallback: Metadata): Metadata {
  if (!seo || typeof seo !== 'object') return fallback;
  const { title: _title, ogTitle: _ogTitle, canonical: _canonical, ...rest } = seo;
  const site = buildSiteMetadata({ ...rest, title: undefined }, {});
  return {
    ...site,
    title: undefined,
    ...fallback,
    openGraph: { ...site.openGraph, title: undefined, url: undefined, ...fallback.openGraph },
    twitter: { ...site.twitter, title: undefined, ...fallback.twitter },
  };
}
