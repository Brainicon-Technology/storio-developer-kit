import { cache } from 'react';
import { storio, type StorioBlogCategory, type StorioBlogPost } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { normalizeBlog, normalizeBlogs } from './normalize';
import type { TenantContext } from './tenant';

/**
 * Blog posts: Storio records (collection "blog"). Pages show a post's title with
 * <CmsField collection="blog" item={id} path="title">: saving it in the editor changes the post itself.
 */
export async function loadBlogs(ctx: TenantContext, category?: StorioBlogCategory): Promise<StorioBlogPost[]> {
  // A filter goes in the first argument, with the tenant host: getBlogs({ category: id, tenantHost }).
  const real = normalizeBlogs(await safely(storio.getBlogs(category ? { category: category.id, tenantHost: ctx.tenantHost } : ctx.tenantHost)));
  const demo = category ? DEFAULT_DEMO_DATA.blogs.filter((b) => b.category_name === category.name) : DEFAULT_DEMO_DATA.blogs;
  return withDemoFallback(real, demo, ctx.isStandalone);
}

/** Blog categories (getBlogCategories) with their post counts, for the filter tabs. */
export const loadBlogCategories = cache(async function loadBlogCategories(ctx: TenantContext): Promise<StorioBlogCategory[]> {
  const real = await safely(storio.getBlogCategories(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.blogCategories, ctx.isStandalone);
});

export const loadBlog = cache(async function loadBlog(slug: string, ctx: TenantContext): Promise<StorioBlogPost | null> {
  const real = normalizeBlog(await safely(storio.getBlogDetail(slug, ctx.tenantHost)));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.blogs.find((b) => b.slug === slug), ctx.isStandalone);
});
