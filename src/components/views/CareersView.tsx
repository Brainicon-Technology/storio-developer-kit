'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getCareers()  ->  Job[] (loose records, narrowed)
 *     loadJobs() in src/lib/careers.ts
 */

import Link from 'next/link';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useCareersText } from '@/components/cms/useCareersText';
import { jobTypeLabel } from '@/lib/careers';
import { formatDate } from '@/lib/format';
import type { Job } from '@/lib/types';

const PAGE = 'template-10-starter-careers';

/** Job openings (getCareers, narrowed to Job in src/lib/types.ts). */
export function CareersView({ jobs }: { jobs: Job[] }) {
  const { intro } = useCareersText();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Careers" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>

        {jobs.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.id} className="rounded-2xl border border-black/10 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  {job.job_type && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{jobTypeLabel(job.job_type)}</span>}
                </div>
                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {job.location && (
                    <div className="flex gap-1">
                      <dt className="opacity-60"><CmsField path="locationLabel" label="Location label">{intro.locationLabel}</CmsField>:</dt>
                      <dd>{job.location}</dd>
                    </div>
                  )}
                  {job.vacancy !== undefined && (
                    <div className="flex gap-1">
                      <dt className="opacity-60"><CmsField path="vacancyLabel" label="Vacancy label">{intro.vacancyLabel}</CmsField>:</dt>
                      <dd>{job.vacancy}</dd>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex gap-1">
                      <dt className="opacity-60"><CmsField path="deadlineLabel" label="Deadline label">{intro.deadlineLabel}</CmsField>:</dt>
                      <dd>{formatDate(job.deadline)}</dd>
                    </div>
                  )}
                </dl>
                <Link href={`/careers/${encodeURIComponent(job.slug)}`} className="mt-4 inline-block text-sm font-semibold text-brand">
                  <CmsField path="detailsText" label="Details link">{intro.detailsText}</CmsField>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CmsSection>
    </main>
  );
}
