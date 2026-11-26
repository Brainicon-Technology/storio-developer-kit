import { storio, type StorioFaq } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback } from './data';
import type { TenantContext } from './tenant';

/** Frequently asked questions (dashboard: FAQ). Hidden questions are left out. */
export async function loadFaqs(ctx: TenantContext): Promise<StorioFaq[]> {
  const real = await safely(storio.getFaqs(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.faqs, ctx.isStandalone).filter((f) => f.is_visible !== false);
}
