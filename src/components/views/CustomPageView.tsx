'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getPageBySlug(slug)  ->  StorioCustomPage | null
 *     loadCustomPage() in src/lib/custom-pages.ts
 */

import type { StorioCustomPage } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useFormsText } from '@/components/cms/useFormsText';
import { CustomPageBlocks } from '@/components/site/CustomPageBlocks';
import { RichText } from '@/components/site/RichText';

/**
 * A page the school built in the dashboard (/page/<slug>). Everything on it is school data, with
 * no pencils. The only template text is the link of a Form block, borrowed from the Online forms
 * page's "detail" section (a [slug] route can't be an editor page itself).
 */
const FORMS_PAGE = 'template-10-starter-forms';

export function CustomPageView({ page }: { page: StorioCustomPage }) {
  const { intro } = useFormsText();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <article className="space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight">{page.title}</h1>
        {page.featured_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.featured_image} alt="" className="aspect-video w-full rounded-2xl object-cover" />
        )}
        {typeof page.content === 'string' ? (
          <RichText html={page.content} className="text-lg leading-relaxed" />
        ) : (
          <CmsSection sectionKey="intro" title="Online forms" page={FORMS_PAGE}>
            <CustomPageBlocks
              blocks={page.content}
              formLinkText={<CmsField path="openText" label="Open form link">{intro.openText}</CmsField>}
            />
          </CmsSection>
        )}
      </article>
    </main>
  );
}
