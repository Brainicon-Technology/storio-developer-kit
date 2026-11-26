'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getJobDetail(slug)  ->  Job | null (loose record, narrowed)
 *     loadJob() in src/lib/careers.ts
 */

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useCareersText } from '@/components/cms/useCareersText';
import { RichText } from '@/components/site/RichText';
import { jobTypeLabel } from '@/lib/careers';
import { formatDate } from '@/lib/format';
import type { Job } from '@/lib/types';

/**
 * One job (getJobDetail). Like the activity page, this [slug] route is not an editor page:
 * its labels are the Careers page's "detail" section (and its "intro" labels for the facts).
 */
const LIST_PAGE = 'template-10-starter-careers';

export function JobDetailView({ job }: { job: Job }) {
  const { intro, detail } = useCareersText();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CmsSection sectionKey="detail" title="Job page labels" page={LIST_PAGE}>
        <Link href="/careers" className="text-sm font-semibold text-brand">
          <CmsField path="backText" label="Back link">{detail.backText}</CmsField>
        </Link>

        <article className="mt-6 space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">{job.title}</h1>
          <dl className="grid gap-4 rounded-2xl bg-surface p-5 sm:grid-cols-3">
            {job.location && (
              <div>
                <dt className="text-sm opacity-60">{intro.locationLabel}</dt>
                <dd className="font-semibold">{job.location}</dd>
              </div>
            )}
            {job.vacancy !== undefined && (
              <div>
                <dt className="text-sm opacity-60">{intro.vacancyLabel}</dt>
                <dd className="font-semibold">
                  {job.vacancy} {job.job_type && `· ${jobTypeLabel(job.job_type)}`}
                </dd>
              </div>
            )}
            {job.deadline && (
              <div>
                <dt className="text-sm opacity-60">{intro.deadlineLabel}</dt>
                <dd className="font-semibold">{formatDate(job.deadline)}</dd>
              </div>
            )}
          </dl>
          <RichText html={job.description} className="space-y-4 text-lg leading-relaxed" />
          {job.attachments_data && job.attachments_data.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">
                <CmsField path="attachmentsTitle" label="Documents title">{detail.attachmentsTitle}</CmsField>
              </h2>
              <ul className="space-y-2">
                {job.attachments_data.map((file, i) => (
                  <li key={file.id ?? i}>
                    <a href={file.url} className="inline-flex items-center gap-2 font-semibold text-brand">
                      <FileText className="h-4 w-4" aria-hidden />
                      {file.file_name || file.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {job.application_link && (
            <a href={job.application_link} className="inline-block rounded-xl bg-brand px-5 py-3 font-semibold text-white">
              <CmsField path="applyText" label="Apply button">{detail.applyText}</CmsField>
            </a>
          )}
        </article>
      </CmsSection>
    </main>
  );
}
