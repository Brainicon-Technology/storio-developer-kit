import { cache } from 'react';
import { storio, type StorioActivityItem } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { normalizeActivities, normalizeActivity } from './normalize';
import type { TenantContext } from './tenant';

/** Sports, clubs and co-curricular activities (dashboard: Activities). */
export async function loadActivities(ctx: TenantContext): Promise<StorioActivityItem[]> {
  const real = normalizeActivities(await safely(storio.getActivities(ctx.tenantHost)));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.activities, ctx.isStandalone);
}

export const loadActivity = cache(async function loadActivity(slug: string, ctx: TenantContext): Promise<StorioActivityItem | null> {
  const real = normalizeActivity(await safely(storio.getActivityDetail(slug, ctx.tenantHost)));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.activities.find((a) => a.slug === slug), ctx.isStandalone);
});

/** Activities have two names for some fields; these read whichever the school's data has. */
export const activitySummary = (a: StorioActivityItem) => a.summary || a.excerpt || '';
export const activityImage = (a: StorioActivityItem) => a.featured_image_url || a.image || '';
export const activityDate = (a: StorioActivityItem) => a.published_at || a.date || '';
export const activityPath = (a: StorioActivityItem) => `/activities/${encodeURIComponent(a.slug || String(a.id))}`;
