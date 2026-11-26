'use client';

import pageDefaults from '@/content/template-0-starter-academics.json';
import { usePageText } from './usePageText';

export type AcademicsText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-academics" (defaults + the school's saved values). */
export function useAcademicsText(): AcademicsText {
  return usePageText('template-0-starter-academics', pageDefaults);
}
