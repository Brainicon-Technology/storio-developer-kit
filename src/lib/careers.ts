import { storio } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import type { TenantContext } from './tenant';
import { narrowList, toJob, type Job } from './types';

/**
 * Job openings. getCareers and getJobDetail return loose records in the SDK:
 * each one is narrowed with toJob (src/lib/types.ts) to follow Rule 2 (no `any`).
 */
export async function loadJobs(ctx: TenantContext): Promise<Job[]> {
  const real = narrowList(await safely(storio.getCareers(ctx.tenantHost)), toJob);
  return withDemoFallback(real, DEFAULT_DEMO_DATA.jobs, ctx.isStandalone).filter((job) => !job.status || job.status === 'active');
}

export async function loadJob(slug: string, ctx: TenantContext): Promise<Job | null> {
  const raw = await safely(storio.getJobDetail(slug, ctx.tenantHost));
  const real = raw ? toJob(raw) : null;
  return withDemoRecord(real, DEFAULT_DEMO_DATA.jobs.find((job) => job.slug === slug), ctx.isStandalone);
}

/** "full_time" -> "Full time". */
export const jobTypeLabel = (type: string | undefined) => (type ? type.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '');
