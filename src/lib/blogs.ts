import { storio, type StorioBlogPost } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { normalizeBlog, normalizeBlogs } from './normalize';
import type { TenantContext } from './tenant';

/**
 * Blog posts: Storio records (collection "blog"). Pages show a post's title with
 * <CmsField collection="blog" item={id} path="title">: saving it in the editor changes the post itself.
 */
export async function loadBlogs(ctx: TenantContext): Promise<StorioBlogPost[]> {
  const real = normalizeBlogs(await safely(storio.getBlogs(ctx.tenantHost)));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.blogs, ctx.isStandalone);
}

export async function loadBlog(slug: string, ctx: TenantContext): Promise<StorioBlogPost | null> {
  const real = normalizeBlog(await safely(storio.getBlogDetail(slug, ctx.tenantHost)));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.blogs.find((b) => b.slug === slug), ctx.isStandalone);
}
