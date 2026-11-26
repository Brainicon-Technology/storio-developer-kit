'use client';

import Link from 'next/link';
import type { StorioBlogPost } from '@storio/template-sdk';
import { CmsField, CmsSection, useCollectionItem } from '@/lib/storio-editor/site';

import { useBlogDetailText } from '@/components/cms/useBlogDetailText';
import { RichText } from '@/components/site/RichText';
import { formatDate } from '@/lib/format';

const PAGE = 'template-0-starter-blog-detail';

/**
 * One blog post (getBlogDetail), an editor page with collection "blog".
 * The title is a record field, shown live while the admin types (useCollectionItem).
 * The body is HTML from the dashboard's rich text editor: rendered with <RichText>.
 */
export function BlogDetailView({ post }: { post: StorioBlogPost | null }) {
  const { labels } = useBlogDetailText();
  const id = post ? String(post.id) : '';
  const values = useCollectionItem('blog', id, { title: post?.title ?? '' });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CmsSection sectionKey="labels" title="Labels" page={PAGE}>
        <Link href="/blogs" className="text-sm font-semibold text-brand">
          <CmsField path="backText" label="Back link">{labels.backText}</CmsField>
        </Link>

        {!post ? (
          <p className="mt-8 opacity-70">
            <CmsField path="notFoundText" label="Not found text">{labels.notFoundText}</CmsField>
          </p>
        ) : (
          <article className="mt-6 space-y-6">
            {post.category_name && <p className="text-xs font-semibold uppercase tracking-wider text-accent">{post.category_name}</p>}
            <h1 className="text-4xl font-extrabold tracking-tight">
              <CmsField collection="blog" item={id} path="title" label="Post title">{values.title}</CmsField>
            </h1>
            {post.published_at && (
              <p className="text-sm opacity-60">
                <CmsField path="publishedLabel" label="Published label">{labels.publishedLabel}</CmsField> {formatDate(post.published_at)}
              </p>
            )}
            {post.featured_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.featured_image_url} alt="" className="aspect-video w-full rounded-2xl object-cover" />
            )}
            <RichText html={post.content || post.summary} className="space-y-4 text-lg leading-relaxed" />
          </article>
        )}
      </CmsSection>
    </main>
  );
}
