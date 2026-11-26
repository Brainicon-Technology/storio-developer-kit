import { storio, type StorioHeroSlide, type StorioImportantLink, type StorioPromotion, type StorioTestimonial } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { byOrder, safely, withDemoFallback, withDemoRecord } from './data';
import { normalizeHeroSlides, normalizePromotions, normalizeTestimonials } from './normalize';
import type { TenantContext } from './tenant';

/** Hero carousel slides (dashboard: Hero Slides), in the school's order. */
export async function loadHeroSlides(ctx: TenantContext): Promise<StorioHeroSlide[]> {
  const real = normalizeHeroSlides(await safely(storio.getHeroSlides(ctx.tenantHost)));
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.heroSlides, ctx.isStandalone));
}

/** Active promotions: banners and popups (dashboard: Promotions). */
export async function loadPromotions(ctx: TenantContext): Promise<StorioPromotion[]> {
  const real = normalizePromotions(await safely(storio.getPromotions(ctx.tenantHost)));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.promotions, ctx.isStandalone);
}

/** One promotion (getPromotionDetail), for the click route src/app/promotions/[id]/route.ts. */
export async function loadPromotion(id: number, ctx: TenantContext): Promise<StorioPromotion | null> {
  const real = normalizePromotions(listOrNull(await safely(storio.getPromotionDetail(id, ctx.tenantHost))))?.[0] ?? null;
  return withDemoRecord(real, DEFAULT_DEMO_DATA.promotions.find((p) => p.id === id), ctx.isStandalone);
}

/** Counts a click on a promotion's button (trackPromotionClick). Never called in Standalone Preview. */
export async function trackPromotion(id: number, ctx: TenantContext): Promise<void> {
  if (!ctx.isStandalone) await safely(storio.trackPromotionClick(id, ctx.tenantHost));
}

const listOrNull = <T,>(record: T | null): T[] | null => (record ? [record] : null);

/** Testimonials (dashboard: Testimonials). Active ones, photos with absolute URLs. */
export async function loadTestimonials(ctx: TenantContext): Promise<StorioTestimonial[]> {
  const real = normalizeTestimonials(await safely(storio.getTestimonials(ctx.tenantHost)));
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.testimonials, ctx.isStandalone));
}

/** Quick links to boards, ministries and resources. */
export async function loadImportantLinks(ctx: TenantContext): Promise<StorioImportantLink[]> {
  const real = await safely(storio.getImportantLinks(ctx.tenantHost));
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.importantLinks, ctx.isStandalone));
}
