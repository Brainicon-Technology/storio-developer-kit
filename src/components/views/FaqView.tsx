'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getFaqs()  ->  StorioFaq[]
 *     loadFaqs() in src/lib/faqs.ts
 */

import Link from 'next/link';
import type { StorioFaq } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useFaqText } from '@/components/cms/useFaqText';

const PAGE = 'template-10-starter-faq';

/** All FAQs (getFaqs). Questions and answers are school data, edited on the dashboard's FAQ page. */
export function FaqView({ faqs }: { faqs: StorioFaq[] }) {
  const { intro } = useFaqText();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CmsSection sectionKey="intro" title="FAQ" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>{' '}
            <Link href="/contact" className="font-semibold text-brand">
              <CmsField path="contactText" label="Contact link">{intro.contactText}</CmsField>
            </Link>
          </p>
        </header>

        {faqs.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <div className="space-y-4">
            {faqs.map((item) => (
              <details key={item.id} className="rounded-xl border border-black/10 p-4">
                <summary className="cursor-pointer font-semibold">{item.question}</summary>
                <p className="mt-2 whitespace-pre-line opacity-80">{item.answer}</p>
              </details>
            ))}
          </div>
        )}
      </CmsSection>
    </main>
  );
}
