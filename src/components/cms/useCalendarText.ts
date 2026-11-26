'use client';

import pageDefaults from '@/content/template-10-starter-calendar.json';
import { usePageText } from './usePageText';

export type CalendarText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-calendar" (defaults + the school's saved values). */
export function useCalendarText(): CalendarText {
  return usePageText('template-10-starter-calendar', pageDefaults);
}
