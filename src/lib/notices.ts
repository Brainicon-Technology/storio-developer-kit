import { storio, type StorioNotice } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
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
  const real = await safely(storio.getNotices(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.notices, ctx.isStandalone);
}

export async function loadNotice(id: string, ctx: TenantContext): Promise<StorioNotice | null> {
  const real = await safely(storio.getNoticeDetail(id, ctx.tenantHost));
  const demo = DEFAULT_DEMO_DATA.notices.find((n) => String(n.id) === id);
  return withDemoRecord(real, demo, ctx.isStandalone);
}
