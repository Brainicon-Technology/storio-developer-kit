import { cache } from 'react';
import { storio, type StorioNotice } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { normalizeNotice, normalizeNotices } from './normalize';
import type { TenantContext } from './tenant';

/**
 * ============================================================================
 * Notices: Storio records loaded with @storio/template-sdk
 * ============================================================================
 * Notices are the school's records, not page content. Pages show a notice's
 * title with <CmsField collection="notice" item={id} path="title">: in the
 * Storio editor an admin can change it, and the save changes the notice itself
 * (the same record the dashboard's Notices page edits).
 * ============================================================================
 */

export const loadNotices = cache(async function loadNotices(ctx: TenantContext): Promise<StorioNotice[]> {
  const real = normalizeNotices(await safely(storio.getNotices(ctx.tenantHost)));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.notices, ctx.isStandalone);
});

export const loadNotice = cache(async function loadNotice(id: string, ctx: TenantContext): Promise<StorioNotice | null> {
  const real = normalizeNotice(await safely(storio.getNoticeDetail(id, ctx.tenantHost)));
  const demo = DEFAULT_DEMO_DATA.notices.find((n) => String(n.id) === id);
  return withDemoRecord(real, demo, ctx.isStandalone);
});

/**
 * /notices?q=exam: storio.getNotices({ search }) filters by title and content on the server.
 * List methods take their filters as the first argument and the tenant host in the same object
 * (or as the second argument): getNotices({ search: 'exam', tenantHost }).
 */
export async function searchNotices(query: string, ctx: TenantContext): Promise<StorioNotice[]> {
  const search = query.trim().slice(0, 100);
  if (!search) return loadNotices(ctx);

  const found = normalizeNotices(await safely(storio.getNotices({ search, tenantHost: ctx.tenantHost })));
  if (!ctx.isStandalone) return found ?? [];

  // Standalone Preview: search the demo notices the same way.
  const needle = search.toLowerCase();
  return DEFAULT_DEMO_DATA.notices.filter((n) => `${n.title} ${n.content ?? ''}`.toLowerCase().includes(needle));
}
