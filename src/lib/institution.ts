import { storio, type StorioInstitutionProfile } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoRecord } from './data';
import { mediaUrl } from './normalize';
import type { TenantContext } from './tenant';

/** EIIN, codes, mission, vision and key numbers (dashboard: Institution Profile). */
export async function loadInstitutionProfile(ctx: TenantContext): Promise<StorioInstitutionProfile | null> {
  const real = await safely(storio.getInstitutionProfile(ctx.tenantHost));
  const profile = real ? { ...real, institution_image_url: mediaUrl(real.institution_image_url) } : null;
  return withDemoRecord(profile, DEFAULT_DEMO_DATA.institutionProfile, ctx.isStandalone);
}
