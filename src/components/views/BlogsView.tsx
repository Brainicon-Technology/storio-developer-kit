'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getBlogs()  ->  StorioBlogPost[]
 *     loadBlogs() in src/lib/blogs.ts
 */

import Link from 'next/link';
import type { StorioBlogPost } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useBlogsText } from '@/components/cms/useBlogsText';
import { formatDate } from '@/lib/format';

const PAGE = 'template-0-starter-blogs';

/**
 * Blog list (getBlogs). Fixed texts are page content; each post's title is a record field
 * (collection="blog"): saving it in the editor changes the post itself.
 */
export function BlogsView({ posts }: { posts: StorioBlogPost[] }) {
  const { intro } = useBlogsText();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <CmsSection sectionKey="intro" title="News" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-col overflow-hidden rounded-2xl border border-black/10">
                {post.featured_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.featured_image_url} alt="" className="aspect-video w-full object-cover" />
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {[post.category_name, formatDate(post.published_at)].filter(Boolean).join(' · ')}
                  </p>
                  <h2 className="text-lg font-semibold">
                    <CmsField collection="blog" item={post.slug} path="title" label="Post title">
                      {post.title}
                    </CmsField>
                  </h2>
                  {post.summary && (
                    <p className="flex-1 text-sm opacity-80">
                      <CmsField collection="blog" item={post.slug} path="excerpt" label="Excerpt">{post.summary}</CmsField>
                    </p>
                  )}
                  <Link href={`/blogs/${encodeURIComponent(post.slug)}`} className="mt-2 text-sm font-semibold text-brand">
                    <CmsField path="readMoreText" label="Read more">{intro.readMoreText}</CmsField>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CmsSection>
    </main>
  );
}
