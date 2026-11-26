'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { StorioPromotion } from '@storio/template-sdk';

/**
 * The school's first active promotion (getPromotions), shown above the header on every page.
 * School data: edited on the dashboard's Promotions page, so no pencil. Visitors can dismiss it.
 */
export function PromotionBar({ promotion }: { promotion: StorioPromotion | undefined }) {
  const [hidden, setHidden] = useState(false);
  if (!promotion || hidden) return null;

  const cta =
    promotion.cta_label && promotion.cta_url ? (
      promotion.cta_is_external ? (
        <a href={promotion.cta_url} target="_blank" rel="noreferrer" className="font-semibold underline">
          {promotion.cta_label}
        </a>
      ) : (
        <Link href={promotion.cta_url} className="font-semibold underline">
          {promotion.cta_label}
        </Link>
      )
    ) : null;

  return (
    <div className="bg-brand text-sm text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2">
        {promotion.badge_text && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{promotion.badge_text}</span>}
        <p className="flex-1">
          <span className="font-semibold">{promotion.title}</span>
          {promotion.description && <span className="opacity-90"> {promotion.description}</span>} {cta}
        </p>
        <button type="button" onClick={() => setHidden(true)} aria-label="Dismiss" className="rounded p-1 hover:bg-white/10">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
