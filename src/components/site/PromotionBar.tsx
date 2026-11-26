'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { StorioPromotion } from '@storio/template-sdk';

/**
 * The school's first active promotion (getPromotions), shown above the header on every page.
 * School data: edited on the dashboard's Promotions page, so no pencil. Visitors can dismiss it.
 * getPromotions -> StorioPromotion[] (loadPromotions in src/lib/home.ts).
 */
export function PromotionBar({ promotion, dismissLabel }: { promotion: StorioPromotion | undefined; dismissLabel: string }) {
  const [hidden, setHidden] = useState(false);
  if (!promotion || hidden) return null;

  // The button goes through /promotions/<id> (src/app/promotions/[id]/route.ts), which counts the
  // click with storio.trackPromotionClick and then redirects to the promotion's own link.
  const cta =
    promotion.cta_label && promotion.cta_url ? (
      <a
        href={`/promotions/${promotion.id}`}
        target={promotion.cta_is_external ? '_blank' : undefined}
        rel={promotion.cta_is_external ? 'noreferrer' : undefined}
        className="font-semibold underline"
      >
        {promotion.cta_label}
      </a>
    ) : null;

  return (
    <div className="bg-brand text-sm text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2">
        {promotion.badge_text && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{promotion.badge_text}</span>}
        <p className="flex-1">
          <span className="font-semibold">{promotion.title}</span>
          {promotion.description && <span className="opacity-90"> {promotion.description}</span>} {cta}
        </p>
        <button type="button" onClick={() => setHidden(true)} aria-label={dismissLabel} className="rounded p-1 hover:bg-white/10">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
