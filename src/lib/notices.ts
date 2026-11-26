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

export async function loadNotices(ctx: TenantContext): Promise<StorioNotice[]> {
  const real = normalizeNotices(await safely(storio.getNotices(ctx.tenantHost)));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.notices, ctx.isStandalone);
}

export async function loadNotice(id: string, ctx: TenantContext): Promise<StorioNotice | null> {
  const real = normalizeNotice(await safely(storio.getNoticeDetail(id, ctx.tenantHost)));
  const demo = DEFAULT_DEMO_DATA.notices.find((n) => String(n.id) === id);
  return withDemoRecord(real, demo, ctx.isStandalone);
}

/**
 * Search notices with storio.apiFetch: the low-level call every SDK method is built on.
 * Use it when a named method can't send what you need. getNotices takes no query parameters,
 * but the endpoint supports ?search= (see docs/Storio_SDK_V2_Endpoints_and_Methods_Guide.md).
 * Pass the tenant host in the options, and type the result yourself.
 */
export async function searchNotices(query: string, ctx: TenantContext): Promise<StorioNotice[]> {
  const q = query.trim().slice(0, 100);
  if (!q) return loadNotices(ctx);

  const real = await safely(
    storio.apiFetch<unknown>(`/api/v2/template/notices/?search=${encodeURIComponent(q)}`, {
      tenantHost: ctx.tenantHost,
      next: { revalidate: 60 },
    }),
  );
  const found = normalizeNotices(real);
  if (found) return found;

  // Standalone Preview: search the demo notices the same way.
  const needle = q.toLowerCase();
  const demo = DEFAULT_DEMO_DATA.notices.filter((n) => `${n.title} ${n.content ?? ''}`.toLowerCase().includes(needle));
  return ctx.isStandalone ? demo : [];
}
