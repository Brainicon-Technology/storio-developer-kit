'use client';

import { usePageContent } from '@/lib/storio-editor/site';
import pageDefaults from '@/content/template-0-starter-about.json';

export type AboutText = typeof pageDefaults;

/**
 * The editable texts of the page "template-0-starter-about" (Storio editor). Each section is filled from the
 * defaults first, then overlaid with the school's saved values.
 */
export function useAboutText(): AboutText {
  const content = usePageContent<AboutText>('template-0-starter-about') as Record<string, unknown>;
  const merged: Record<string, unknown> = {};
  for (const [section, defaults] of Object.entries(pageDefaults)) {
    const saved = content?.[section];
    merged[section] =
      defaults && typeof defaults === 'object' && !Array.isArray(defaults) && saved && typeof saved === 'object' && !Array.isArray(saved)
        ? { ...defaults, ...saved }
        : (saved ?? defaults);
  }
  return merged as AboutText;
}
