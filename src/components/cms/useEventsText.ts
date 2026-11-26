'use client';

import pageDefaults from '@/content/template-0-starter-events.json';
import { usePageText } from './usePageText';

export type EventsText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-events" (defaults + the school's saved values). */
export function useEventsText(): EventsText {
  return usePageText('template-0-starter-events', pageDefaults);
}
