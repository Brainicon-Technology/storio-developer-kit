import { storio, type StorioInstitutionProfile } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/** EIIN, codes, mission, vision and key numbers (dashboard: Institution Profile). */
export async function loadInstitutionProfile(ctx: TenantContext): Promise<StorioInstitutionProfile | null> {
  const real = await safely(storio.getInstitutionProfile(ctx.tenantHost));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.institutionProfile, ctx.isStandalone);
}
