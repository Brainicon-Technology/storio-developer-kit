'use client';

import Link from 'next/link';
import type { StorioNotice } from '@storio/template-sdk';
import { CmsField, CmsSection, useCollectionItem, usePageContent } from '@brainicon/storio-elements-editor/site';

import type noticeDetailDefaults from '@/content/notice-detail.json';

type NoticeDetailContent = typeof noticeDetailDefaults;

/**
 * Detail page of a collection record ([id] route).
 * useCollectionItem applies the editor's unsaved changes in the studio preview.
 */
export function NoticeDetailView({ notice }: { notice: StorioNotice | null }) {
  const { labels } = usePageContent<NoticeDetailContent>('notice-detail');
  const id = notice ? String(notice.id) : '';
  const values = useCollectionItem('notices', id, {
    title: notice?.title ?? '',
    content: notice?.content ?? '',
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CmsSection sectionKey="labels" title="Labels">
        <Link href="/notices" className="text-sm font-semibold text-brand">
          <CmsField path="backText" label="Back link">{labels.backText}</CmsField>
        </Link>

        {!notice ? (
          <p className="mt-8 opacity-70">
            <CmsField path="notFoundText" label="Not found text">{labels.notFoundText}</CmsField>
          </p>
        ) : (
          <article className="mt-6 space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight">
              <CmsField collection="notices" item={id} path="title" label="Notice title">{values.title}</CmsField>
            </h1>
            {notice.published_date && (
              <p className="text-sm opacity-60">
                <CmsField path="publishedLabel" label="Published label">{labels.publishedLabel}</CmsField>{' '}
                {notice.published_date}
              </p>
            )}
            <p className="whitespace-pre-line text-lg leading-relaxed">
              <CmsField collection="notices" item={id} path="content" label="Notice text">{values.content}</CmsField>
            </p>
            {notice.attachment_url && (
              <a href={notice.attachment_url} className="inline-block rounded-xl bg-brand px-5 py-3 font-semibold text-white">
                <CmsField path="attachmentText" label="Attachment link">{labels.attachmentText}</CmsField>
              </a>
            )}
          </article>
        )}
      </CmsSection>
    </main>
  );
}
