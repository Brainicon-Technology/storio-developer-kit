import type { Metadata } from 'next';

import { BlogsView } from '@/components/views/BlogsView';
import { loadBlogs } from '@/lib/blogs';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-blogs');
}

export default async function BlogsPage() {
  const posts = await loadBlogs(await resolveTenant());
  return <BlogsView posts={posts} />;
}
