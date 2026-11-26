import type { Metadata } from 'next';

import { BlogDetailView } from '@/components/views/BlogDetailView';
import { htmlToText } from '@/components/site/RichText';
import { loadBlog } from '@/lib/blogs';
import { resolveTenant } from '@/lib/tenant';

/** One blog post (collection "blog"). Metadata comes from the post itself. */
export async function generateMetadata({ params }: PageProps<'/blogs/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadBlog(slug, await resolveTenant());
  if (!post) return {};
  return {
    title: post.title,
    description: (post.summary || htmlToText(post.content)).slice(0, 160),
    openGraph: post.featured_image_url ? { images: [post.featured_image_url] } : undefined,
  };
}

export default async function BlogDetailPage({ params }: PageProps<'/blogs/[slug]'>) {
  const { slug } = await params;
  const post = await loadBlog(slug, await resolveTenant());
  return <BlogDetailView post={post} />;
}
