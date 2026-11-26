'use client';

import Link from 'next/link';
import type { StorioNotice } from '@storio/template-sdk';
import { formatDate } from '@/lib/format';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useNoticesText } from '@/components/cms/useNoticesText';

const PAGE = 'template-0-starter-notices';

/**
 * List page of a collection. Fixed text (heading, labels) is page content; each
 * notice's title is a record field (collection="notice"): saving it changes the notice itself.
 */
export function NoticesView({ notices, query }: { notices: StorioNotice[]; query: string }) {
  const { intro } = useNoticesText();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Notice board" page={PAGE}>
        <section className="mb-8 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </section>

        {/* A plain GET form: the page reads ?q= and searches with storio.apiFetch (src/lib/notices.ts). */}
        <form action="/notices" role="search" className="mb-8 flex gap-2">
          <label className="sr-only" htmlFor="notice-search">
            <CmsField path="searchLabel" label="Search label">{intro.searchLabel}</CmsField>
          </label>
          <input
            id="notice-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={intro.searchPlaceholder}
            className="flex-1 rounded-lg border border-black/15 bg-page px-3 py-2"
          />
          <button type="submit" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white">
            <CmsField path="searchButton" label="Search button">{intro.searchButton}</CmsField>
          </button>
        </form>

        {notices.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            {query ? (
              <CmsField path="noResultsText" label="No results text">{intro.noResultsText}</CmsField>
            ) : (
              <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
            )}
          </p>
        ) : (
          <ul className="space-y-4">
            {notices.map((notice) => (
              <li key={notice.id} className="rounded-xl border border-black/10 p-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    <CmsField collection="notice" item={String(notice.id)} path="title" label="Notice title">
                      {notice.title}
                    </CmsField>
                  </h2>
                  {notice.is_urgent && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                      <CmsField path="urgentLabel" label="Urgent label">{intro.urgentLabel}</CmsField>
                    </span>
                  )}
                </div>
                {notice.published_date && <p className="mt-1 text-xs opacity-60">{formatDate(notice.published_date)}</p>}
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
