import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { RichText, htmlToText } from '@/components/site/RichText';
import { customPageHtml, loadCustomPage } from '@/lib/custom-pages';
import { resolveTenant } from '@/lib/tenant';

/**
 * Custom pages (getPageBySlug): pages the school builds itself in the dashboard, at /page/<slug>.
 * Everything on them is school data, so this is a plain Server Component: no View, no editor page,
 * no pencils. An unknown slug returns a real 404 with notFound().
 */
export async function generateMetadata({ params }: PageProps<'/page/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadCustomPage(slug, await resolveTenant());
  if (!page) return {};
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || htmlToText(customPageHtml(page)).slice(0, 160),
    openGraph: page.featured_image ? { images: [page.featured_image] } : undefined,
  };
}

export default async function CustomPage({ params }: PageProps<'/page/[slug]'>) {
  const { slug } = await params;
  const page = await loadCustomPage(slug, await resolveTenant());
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <article className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">{page.title}</h1>
        {page.featured_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.featured_image} alt="" className="aspect-video w-full rounded-2xl object-cover" />
        )}
        <RichText html={customPageHtml(page)} className="text-lg leading-relaxed" />
      </article>
    </main>
  );
}
