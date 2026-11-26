'use client';

import pageDefaults from '@/content/template-10-starter-events.json';
import { usePageText } from './usePageText';

export type EventsText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-events" (defaults + the school's saved values). */
export function useEventsText(): EventsText {
  return usePageText('template-10-starter-events', pageDefaults);
}
