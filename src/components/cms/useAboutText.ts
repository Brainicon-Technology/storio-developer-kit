'use client';

import pageDefaults from '@/content/template-10-starter-about.json';
import { usePageText } from './usePageText';

export type AboutText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-about" (defaults + the school's saved values). */
export function useAboutText(): AboutText {
  return usePageText('template-10-starter-about', pageDefaults);
}
