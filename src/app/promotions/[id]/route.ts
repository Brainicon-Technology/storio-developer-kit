import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { loadPromotion, trackPromotion } from '@/lib/home';
import { resolveTenant } from '@/lib/tenant';

/**
 * /promotions/<id>: the promotion bar's button points here instead of straight at the CTA link.
 * 1. storio.getPromotionDetail(id) -> StorioPromotion | null: the link comes from the promotion itself,
 *    so this route can only send visitors where the school's own promotion points (no open redirect);
 * 2. storio.trackPromotionClick(id) -> { success }: counts the click (the dashboard shows click_count);
 * 3. redirects to cta_url. In Standalone Preview nothing is sent to Storio.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<'/promotions/[id]'>) {
  const { id } = await ctx.params;
  const tenant = await resolveTenant();
  const promotion = /^\d+$/.test(id) ? await loadPromotion(Number(id), tenant) : null;
  if (!promotion?.cta_url) redirect('/');

  await trackPromotion(promotion.id, tenant);
  redirect(promotion.cta_url);
}
