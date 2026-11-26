import { cache } from 'react';
import { storio, type StorioActivityCategory, type StorioActivityItem } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { normalizeActivities, normalizeActivity, type ActivityItem } from './normalize';
import type { TenantContext } from './tenant';

/** Sports, clubs and co-curricular activities (dashboard: Activities). */
export async function loadActivities(ctx: TenantContext, category?: StorioActivityCategory): Promise<ActivityItem[]> {
  const real = normalizeActivities(await safely(storio.getActivities(category ? { category: category.id, tenantHost: ctx.tenantHost } : ctx.tenantHost)));
  const demo = category ? DEFAULT_DEMO_DATA.activities.filter((a) => a.category_name === category.name) : DEFAULT_DEMO_DATA.activities;
  return withDemoFallback(real, demo, ctx.isStandalone);
}

/** Activity categories (getActivityCategories) with their counts, for the filter tabs. */
export const loadActivityCategories = cache(async function loadActivityCategories(ctx: TenantContext): Promise<StorioActivityCategory[]> {
  const real = await safely(storio.getActivityCategories(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.activityCategories, ctx.isStandalone);
});

export const loadActivity = cache(async function loadActivity(slug: string, ctx: TenantContext): Promise<StorioActivityItem | null> {
  const real = normalizeActivity(await safely(storio.getActivityDetail(slug, ctx.tenantHost)));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.activities.find((a) => a.slug === slug), ctx.isStandalone);
});

/** Activities have two names for some fields; these read whichever the school's data has. */
export const activitySummary = (a: StorioActivityItem) => a.summary || a.excerpt || '';
export const activityImage = (a: StorioActivityItem) => a.featured_image_url || a.image || '';
export const activityDate = (a: StorioActivityItem) => a.published_at || a.date || '';
export const activityPath = (a: StorioActivityItem) => `/activities/${encodeURIComponent(a.slug || String(a.id))}`;
