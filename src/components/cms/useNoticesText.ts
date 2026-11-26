'use client';

import pageDefaults from '@/content/template-0-starter-notices.json';
import { usePageText } from './usePageText';

export type NoticesText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-notices" (defaults + the school's saved values). */
export function useNoticesText(): NoticesText {
  return usePageText('template-0-starter-notices', pageDefaults);
}
