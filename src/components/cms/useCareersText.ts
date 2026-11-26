'use client';

import pageDefaults from '@/content/template-10-starter-careers.json';
import { usePageText } from './usePageText';

export type CareersText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-careers" (defaults + the school's saved values). */
export function useCareersText(): CareersText {
  return usePageText('template-10-starter-careers', pageDefaults);
}
