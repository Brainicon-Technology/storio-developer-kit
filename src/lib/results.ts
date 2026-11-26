import { storio, type StorioBoardNotice, type StorioExamResult } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback } from './data';
import { normalizeBoardNotices } from './normalize';
import type { TenantContext } from './tenant';

/** Published exam results, newest year first. */
export async function loadExamResults(ctx: TenantContext): Promise<StorioExamResult[]> {
  const real = await safely(storio.getExamResults(ctx.tenantHost));
  const results = withDemoFallback(real, DEFAULT_DEMO_DATA.examResults, ctx.isStandalone);
  return [...results].sort((a, b) => Number(b.year ?? 0) - Number(a.year ?? 0));
}

/** Notices synced from the national education boards, newest first. */
export async function loadBoardNotices(ctx: TenantContext): Promise<StorioBoardNotice[]> {
  const real = normalizeBoardNotices(await safely(storio.getBoardNotices(ctx.tenantHost)));
  const notices = withDemoFallback(real, DEFAULT_DEMO_DATA.boardNotices, ctx.isStandalone);
  return [...notices].sort((a, b) => (b.publish_date ?? '').localeCompare(a.publish_date ?? ''));
}

/** "97.5" or 97.5 -> "97.5%". */
export function formatRate(rate: string | number | undefined): string {
  if (rate === undefined || rate === '') return '';
  const text = String(rate);
  return text.endsWith('%') ? text : `${text}%`;
}
