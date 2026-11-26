import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { JobDetailView } from '@/components/views/JobDetailView';
import { htmlToText } from '@/components/site/RichText';
import { loadJob } from '@/lib/careers';
import { resolveTenant } from '@/lib/tenant';

/** One job. Not an editor page; its labels come from the Careers page's "detail" section. */
export async function generateMetadata({ params }: PageProps<'/careers/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const job = await loadJob(slug, await resolveTenant());
  if (!job) return {};
  return { title: job.title, description: htmlToText(job.description).slice(0, 160) };
}

export default async function JobDetailPage({ params }: PageProps<'/careers/[slug]'>) {
  const { slug } = await params;
  const job = await loadJob(slug, await resolveTenant());
  if (!job) notFound(); // a real 404 (src/app/(site)/not-found.tsx)
  return <JobDetailView job={job} />;
}
