import { cache } from 'react';
import { storio, type StorioCareer } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { normalizeCareer, normalizeCareers } from './normalize';
import type { TenantContext } from './tenant';

/** Job openings (dashboard: Careers). Open ones only; attachments get absolute URLs. */
export async function loadJobs(ctx: TenantContext): Promise<StorioCareer[]> {
  const real = normalizeCareers(await safely(storio.getCareers(ctx.tenantHost)));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.jobs, ctx.isStandalone).filter((job) => !job.status || job.status === 'active');
}

/** One job (getJobDetail). */
export const loadJob = cache(async function loadJob(slug: string, ctx: TenantContext): Promise<StorioCareer | null> {
  const real = normalizeCareer(await safely(storio.getJobDetail(slug, ctx.tenantHost)));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.jobs.find((job) => job.slug === slug), ctx.isStandalone);
});

/** "full_time" -> "Full time". */
export const jobTypeLabel = (type: string | undefined) => (type ? type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '');
