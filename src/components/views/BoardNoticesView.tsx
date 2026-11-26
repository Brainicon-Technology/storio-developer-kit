'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getBoardNotices()  ->  StorioBoardNotice[]
 *     loadBoardNotices() in src/lib/results.ts
 */

import { ExternalLink } from 'lucide-react';
import type { StorioBoardNotice } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useBoardNoticesText } from '@/components/cms/useBoardNoticesText';
import { formatDate } from '@/lib/format';

const PAGE = 'template-0-starter-board-notices';

/** Notices synced from the national education boards (getBoardNotices). Links open the board's site. */
export function BoardNoticesView({ notices }: { notices: StorioBoardNotice[] }) {
  const { intro } = useBoardNoticesText();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Board notices" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>

        {notices.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <ul className="divide-y divide-black/10 rounded-2xl border border-black/10">
            {notices.map((notice, i) => (
              <li key={notice.id ?? i} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{notice.title}</p>
                  <p className="text-sm opacity-70">{[notice.board, formatDate(notice.publish_date)].filter(Boolean).join(' · ')}</p>
                </div>
                {notice.url && (
                  <a href={notice.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    <CmsField path="openText" label="Open link">{intro.openText}</CmsField>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </CmsSection>
    </main>
  );
}
