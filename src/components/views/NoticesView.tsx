'use client';

import Link from 'next/link';
import type { StorioNotice } from '@storio/template-sdk';
import { CmsField, CmsSection, usePageContent } from '@brainicon/storio-elements-editor/site';

import type noticesDefaults from '@/content/notices.json';

type NoticesContent = typeof noticesDefaults;

/**
 * List page of a collection. Fixed text (heading, labels) is page content; each
 * notice's own fields are record fields (collection="notices").
 */
export function NoticesView({ notices }: { notices: StorioNotice[] }) {
  const { intro } = usePageContent<NoticesContent>('notices');

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Notice board">
        <section className="mb-8 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </section>

        {notices.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <ul className="space-y-4">
            {notices.map((notice) => (
              <li key={notice.id} className="rounded-xl border border-black/10 p-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    <CmsField collection="notices" item={String(notice.id)} path="title" label="Notice title">
                      {notice.title}
                    </CmsField>
                  </h2>
                  {notice.is_urgent && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                      <CmsField path="urgentLabel" label="Urgent label">{intro.urgentLabel}</CmsField>
                    </span>
                  )}
                </div>
                {notice.published_date && <p className="mt-1 text-xs opacity-60">{notice.published_date}</p>}
                <Link href={`/notices/${notice.id}`} className="mt-3 inline-block text-sm font-semibold text-brand">
                  <CmsField path="readMoreText" label="Read more">{intro.readMoreText}</CmsField>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CmsSection>
    </main>
  );
}
