'use client';

import pageDefaults from '@/content/template-0-starter-blogs.json';
import { usePageText } from './usePageText';

export type BlogsText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-blogs" (defaults + the school's saved values). */
export function useBlogsText(): BlogsText {
  return usePageText('template-0-starter-blogs', pageDefaults);
}
