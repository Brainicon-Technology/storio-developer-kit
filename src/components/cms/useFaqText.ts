'use client';

import pageDefaults from '@/content/template-10-starter-faq.json';
import { usePageText } from './usePageText';

export type FaqText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-faq" (defaults + the school's saved values). */
export function useFaqText(): FaqText {
  return usePageText('template-10-starter-faq', pageDefaults);
}
