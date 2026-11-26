import type { Metadata } from 'next';

import { categoryKey } from '@/components/site/CategoryTabs';
import { BlogsView } from '@/components/views/BlogsView';
import { loadBlogCategories, loadBlogs } from '@/lib/blogs';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-blogs');
}

/** /blogs?category=<slug>: the category's id goes to the SDK filter. */
export default async function BlogsPage({ searchParams }: PageProps<'/blogs'>) {
  const ctx = await resolveTenant();
  const { category: slug } = await searchParams;
  const categories = await loadBlogCategories(ctx);
  const category = categories.find((c) => categoryKey(c) === slug);
  const posts = await loadBlogs(ctx, category);
  return <BlogsView posts={posts} categories={categories} activeCategory={category && categoryKey(category)} />;
}
