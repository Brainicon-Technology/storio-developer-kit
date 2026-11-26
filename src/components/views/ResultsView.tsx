'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getExamResults()  ->  StorioExamResult[]
 *     loadExamResults() in src/lib/results.ts
 */

import type { StorioExamResult } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useResultsText } from '@/components/cms/useResultsText';
import { formatRate } from '@/lib/results';

const PAGE = 'template-10-starter-results';

/** Exam results (getExamResults) as a table. Column headings are editable. */
export function ResultsView({ results }: { results: StorioExamResult[] }) {
  const { intro } = useResultsText();
  const columns = ['examLabel', 'classLabel', 'yearLabel', 'examineesLabel', 'passedLabel', 'failedLabel', 'passRateLabel'] as const;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Results" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>

        {results.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-black/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  {columns.map((path) => (
                    <th key={path} className="p-3 font-semibold">
                      <CmsField path={path} label={path}>{intro[path]}</CmsField>
                    </th>
                  ))}
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-t border-black/10">
                    <td className="p-3 font-semibold">
                      {r.exam_name}
                      {r.exam_type && <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">{r.exam_type}</span>}
                    </td>
                    <td className="p-3">{r.class_name}</td>
                    <td className="p-3">{r.year}</td>
                    <td className="p-3">{r.total_examinees ?? '–'}</td>
                    <td className="p-3">{r.passed ?? '–'}</td>
                    <td className="p-3">{r.failed ?? '–'}</td>
                    <td className="p-3 font-semibold text-brand">{formatRate(r.pass_rate) || '–'}</td>
                    <td className="p-3">
                      {r.file_url && (
                        <a href={r.file_url} className="font-semibold text-brand">
                          <CmsField path="downloadText" label="Download link">{intro.downloadText}</CmsField>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CmsSection>
    </main>
  );
}
