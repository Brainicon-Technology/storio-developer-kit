'use client';

import pageDefaults from '@/content/template-0-starter-event-detail.json';
import { usePageText } from './usePageText';

export type EventDetailText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-event-detail" (defaults + the school's saved values). */
export function useEventDetailText(): EventDetailText {
  return usePageText('template-0-starter-event-detail', pageDefaults);
}
