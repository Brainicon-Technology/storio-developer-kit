'use client';

import pageDefaults from '@/content/template-10-starter-notices.json';
import { usePageText } from './usePageText';

export type NoticesText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-notices" (defaults + the school's saved values). */
export function useNoticesText(): NoticesText {
  return usePageText('template-10-starter-notices', pageDefaults);
}
