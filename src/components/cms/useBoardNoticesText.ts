'use client';

import pageDefaults from '@/content/template-0-starter-board-notices.json';
import { usePageText } from './usePageText';

export type BoardNoticesText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-board-notices" (defaults + the school's saved values). */
export function useBoardNoticesText(): BoardNoticesText {
  return usePageText('template-0-starter-board-notices', pageDefaults);
}
