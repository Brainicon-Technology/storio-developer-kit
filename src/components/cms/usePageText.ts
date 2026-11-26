'use client';

import { usePageContent } from '@/lib/storio-editor/site';

/**
 * The editable texts of one editor page: every section of `defaults` (the page's
 * src/content/<key>.json) overlaid with the school's saved values.
 *
 * Each page has a one-line hook built on this (useHomeText, useBlogsText...), so a View reads
 * typed content: `const { hero } = useHomeText();`.
 */
export function usePageText<T extends Record<string, unknown>>(pageKey: string, defaults: T): T {
  const content = usePageContent<T>(pageKey) as Record<string, unknown>;
  const merged: Record<string, unknown> = {};
  for (const [section, sectionDefaults] of Object.entries(defaults)) {
    const saved = content?.[section];
    merged[section] =
      isPlainObject(sectionDefaults) && isPlainObject(saved) ? { ...sectionDefaults, ...saved } : (saved ?? sectionDefaults);
  }
  return merged as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
