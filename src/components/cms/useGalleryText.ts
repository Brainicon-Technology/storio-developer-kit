'use client';

import pageDefaults from '@/content/template-10-starter-gallery.json';
import { usePageText } from './usePageText';

export type GalleryText = typeof pageDefaults;

/** The editable texts of the page "template-10-starter-gallery" (defaults + the school's saved values). */
export function useGalleryText(): GalleryText {
  return usePageText('template-10-starter-gallery', pageDefaults);
}
