'use client';

import pageDefaults from '@/content/template-10-starter-activities.json';
import { usePageText } from './usePageText';

export type ActivitiesText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-activities" (defaults + the school's saved values). */
export function useActivitiesText(): ActivitiesText {
  return usePageText('template-10-starter-activities', pageDefaults);
}
