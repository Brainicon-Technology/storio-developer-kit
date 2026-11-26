'use client';

import pageDefaults from '@/content/template-10-starter-blog-detail.json';
import { usePageText } from './usePageText';

export type BlogDetailText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-blog-detail" (defaults + the school's saved values). */
export function useBlogDetailText(): BlogDetailText {
  return usePageText('template-10-starter-blog-detail', pageDefaults);
}
