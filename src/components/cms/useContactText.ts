'use client';

import pageDefaults from '@/content/template-0-starter-contact.json';
import { usePageText } from './usePageText';

export type ContactText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-contact" (defaults + the school's saved values). */
export function useContactText(): ContactText {
  return usePageText('template-0-starter-contact', pageDefaults);
}
