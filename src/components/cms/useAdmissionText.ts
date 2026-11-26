'use client';

import pageDefaults from '@/content/template-0-starter-admission.json';
import { usePageText } from './usePageText';

export type AdmissionText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-admission" (defaults + the school's saved values). */
export function useAdmissionText(): AdmissionText {
  return usePageText('template-0-starter-admission', pageDefaults);
}
