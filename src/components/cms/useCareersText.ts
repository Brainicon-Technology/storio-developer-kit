'use client';

import pageDefaults from '@/content/template-0-starter-careers.json';
import { usePageText } from './usePageText';

export type CareersText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-careers" (defaults + the school's saved values). */
export function useCareersText(): CareersText {
  return usePageText('template-0-starter-careers', pageDefaults);
}
