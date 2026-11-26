'use client';

import pageDefaults from '@/content/template-0-starter-notice-detail.json';
import { usePageText } from './usePageText';

export type NoticeDetailText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-notice-detail" (defaults + the school's saved values). */
export function useNoticeDetailText(): NoticeDetailText {
  return usePageText('template-0-starter-notice-detail', pageDefaults);
}
