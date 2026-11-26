'use client';

import pageDefaults from '@/content/template-0-starter-activities.json';
import { usePageText } from './usePageText';

export type ActivitiesText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-activities" (defaults + the school's saved values). */
export function useActivitiesText(): ActivitiesText {
  return usePageText('template-0-starter-activities', pageDefaults);
}
