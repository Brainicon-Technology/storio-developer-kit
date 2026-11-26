import type { Metadata } from 'next';

import { CareersView } from '@/components/views/CareersView';
import { loadJobs } from '@/lib/careers';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-careers');
}

export default async function CareersPage() {
  const jobs = await loadJobs(await resolveTenant());
  return <CareersView jobs={jobs} />;
}
