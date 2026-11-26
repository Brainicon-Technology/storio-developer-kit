import type { MetadataRoute } from 'next';

import manifest from '../../public/storio.template.json';
import { loadCustomPages } from '@/lib/custom-pages';
import { resolveTenant } from '@/lib/tenant';

/**
 * /sitemap.xml for the school's domain: every editor page of this template (routes without
 * [brackets]) plus the school's own custom pages.
 *
 *   storio.getPages()  ->  StorioCustomPage[]   (loadCustomPages in src/lib/custom-pages.ts)
 *
 * resolveTenant() reads the request's host, so each school gets its own URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ctx = await resolveTenant();
  const base = ctx.isStandalone ? 'http://localhost:3000' : `https://${ctx.host}`;

  const routes = manifest.editorPages.map((page) => page.route).filter((route) => !route.includes('['));
  const pages = await loadCustomPages(ctx);

  return [
    ...routes.map((route) => ({ url: `${base}${route === '/' ? '' : route}`, changeFrequency: 'weekly' as const })),
    ...pages.map((page) => ({ url: `${base}/page/${page.slug}`, lastModified: page.updated_at, changeFrequency: 'monthly' as const })),
  ];
}
