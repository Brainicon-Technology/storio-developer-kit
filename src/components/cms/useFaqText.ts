'use client';

import pageDefaults from '@/content/template-0-starter-faq.json';
import { usePageText } from './usePageText';

export type FaqText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-faq" (defaults + the school's saved values). */
export function useFaqText(): FaqText {
  return usePageText('template-0-starter-faq', pageDefaults);
}
