'use client';

import pageDefaults from '@/content/template-0-starter-home.json';
import { usePageText } from './usePageText';

export type HomeText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-home" (defaults + the school's saved values). */
export function useHomeText(): HomeText {
  return usePageText('template-0-starter-home', pageDefaults);
}
