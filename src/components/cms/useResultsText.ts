'use client';

import pageDefaults from '@/content/template-10-starter-results.json';
import { usePageText } from './usePageText';

export type ResultsText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-results" (defaults + the school's saved values). */
export function useResultsText(): ResultsText {
  return usePageText('template-10-starter-results', pageDefaults);
}
