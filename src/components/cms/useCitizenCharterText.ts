'use client';

import pageDefaults from '@/content/template-0-starter-citizen-charter.json';
import { usePageText } from './usePageText';

export type CitizenCharterText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-citizen-charter" (defaults + the school's saved values). */
export function useCitizenCharterText(): CitizenCharterText {
  return usePageText('template-0-starter-citizen-charter', pageDefaults);
}
