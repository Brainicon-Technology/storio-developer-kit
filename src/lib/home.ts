import { storio, type StorioHeroSlide, type StorioImportantLink, type StorioPromotion } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { byOrder, safely, withDemoFallback } from './data';
import type { TenantContext } from './tenant';
import { narrowList, toTestimonial, type Testimonial } from './types';

/** Hero carousel slides (dashboard: Hero Slides), in the school's order. */
export async function loadHeroSlides(ctx: TenantContext): Promise<StorioHeroSlide[]> {
  const real = await safely(storio.getHeroSlides(ctx.tenantHost));
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.heroSlides, ctx.isStandalone));
}

/** Active promotions: banners and popups (dashboard: Promotions). */
export async function loadPromotions(ctx: TenantContext): Promise<StorioPromotion[]> {
  const real = await safely(storio.getPromotions(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.promotions, ctx.isStandalone);
}

/** Testimonials. The SDK returns loose records: narrowed with toTestimonial (Rule 2). */
export async function loadTestimonials(ctx: TenantContext): Promise<Testimonial[]> {
  const real = narrowList(await safely(storio.getTestimonials(ctx.tenantHost)), toTestimonial);
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.testimonials, ctx.isStandalone));
}

/** Quick links to boards, ministries and resources. */
export async function loadImportantLinks(ctx: TenantContext): Promise<StorioImportantLink[]> {
  const real = await safely(storio.getImportantLinks(ctx.tenantHost));
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.importantLinks, ctx.isStandalone));
}
