import { storio, type StorioSettingsResponse } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/**
 * The school's own settings (name, logo, contact details, social links), loaded with the SDK.
 * This is school data, edited on the dashboard's settings pages: it gets no editor pencil.
 */
export async function loadSettings(ctx: TenantContext): Promise<StorioSettingsResponse | null> {
  const real = await storio.getSettings(ctx.tenantHost).catch(() => null);
  return withDemoRecord(real, DEFAULT_DEMO_DATA.settings, ctx.isStandalone);
}
