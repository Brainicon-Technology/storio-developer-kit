'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getNoticeDetail(id)  ->  StorioNotice | null
 *     loadNotice() in src/lib/notices.ts
 */

import Link from 'next/link';
import type { StorioNotice } from '@storio/template-sdk';
import { formatDate } from '@/lib/format';
import { CmsField, CmsSection, useCollectionItem } from '@/lib/storio-editor/site';

import { useNoticeDetailText } from '@/components/cms/useNoticeDetailText';

const PAGE = 'template-0-starter-notice-detail';

/**
 * Detail page of a collection record ([id] route).
 * - The notice's title is a record field (collection="notice"): saving it in the editor changes the
 *   notice itself. Storio lets the editor change only the title of a notice; its text stays SDK data.
 * - useCollectionItem shows the editor's unsaved title live in the preview.
 * - The fixed labels of the page are page content (section "labels").
 */
export function NoticeDetailView({ notice }: { notice: StorioNotice }) {
  const { labels } = useNoticeDetailText();
  const id = String(notice.id);
  const values = useCollectionItem('notice', id, { title: notice.title });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CmsSection sectionKey="labels" title="Labels" page={PAGE}>
        <Link href="/notices" className="text-sm font-semibold text-brand">
          <CmsField path="backText" label="Back link">{labels.backText}</CmsField>
        </Link>

        <article className="mt-6 space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <CmsField collection="notice" item={id} path="title" label="Notice title">{values.title}</CmsField>
          </h1>
          {notice.published_date && (
            <p className="text-sm opacity-60">
              <CmsField path="publishedLabel" label="Published label">{labels.publishedLabel}</CmsField>{' '}
              {formatDate(notice.published_date)}
            </p>
          )}
          <p className="whitespace-pre-line text-lg leading-relaxed">
            {notice.content}
          </p>
          {notice.attachment_url && (
            <a href={notice.attachment_url} className="inline-block rounded-xl bg-brand px-5 py-3 font-semibold text-white">
              <CmsField path="attachmentText" label="Attachment link">{labels.attachmentText}</CmsField>
            </a>
          )}
        </article>
      </CmsSection>
    </main>
  );
}
