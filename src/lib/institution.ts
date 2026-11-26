import { storio, type StorioInstitutionCard, type StorioInstitutionProfile } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { byOrder, safely, withDemoFallback, withDemoRecord } from './data';
import { mediaUrl, normalizeInstitutionCards } from './normalize';
import type { TenantContext } from './tenant';

/** EIIN, codes, mission, vision and key numbers (dashboard: Institution Profile). */
export async function loadInstitutionProfile(ctx: TenantContext): Promise<StorioInstitutionProfile | null> {
  const real = await safely(storio.getInstitutionProfile(ctx.tenantHost));
  const profile = real ? { ...real, institution_image_url: mediaUrl(real.institution_image_url) } : null;
  return withDemoRecord(profile, DEFAULT_DEMO_DATA.institutionProfile, ctx.isStandalone);
}

/**
 * Highlight cards of the institution profile (dashboard: Institution Profile > Cards).
 * storio.getInstitutionCards() -> StorioInstitutionCard[], but the API answers paginated
 * ({ count, results }): normalizeInstitutionCards unwraps it. `icon` is a Material icon name
 * ("menu_book"), drawn with materialIcon() in src/components/site/MaterialIcon.tsx.
 */
export async function loadInstitutionCards(ctx: TenantContext): Promise<StorioInstitutionCard[]> {
  const real = normalizeInstitutionCards(await safely(storio.getInstitutionCards(ctx.tenantHost)));
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.institutionCards, ctx.isStandalone));
}
