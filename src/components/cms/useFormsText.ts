'use client';

import pageDefaults from '@/content/template-10-starter-forms.json';
import { usePageText } from './usePageText';

export type FormsText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-forms" (defaults + the school's saved values). */
export function useFormsText(): FormsText {
  return usePageText('template-10-starter-forms', pageDefaults);
}
