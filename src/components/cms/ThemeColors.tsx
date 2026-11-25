'use client';

import { useEffect } from 'react';
import { themeToCss, themeToCssVariables } from '@/lib/storio-editor/core/theme';
import { THEME_PAGE } from './themePage';

/**
 * Writes the Theme settings colours as CSS variables (primaryColor -> --primary-color), which
 * globals.css maps to the Tailwind colours (bg-brand, text-accent...).
 *
 * In the Storio editor preview it also follows the colour pickers live: the editor sends the
 * unsaved "colors" section of Theme settings with a CMS_DRAFT_PREVIEW message. Visitors only get
 * the published colours, rendered on the server.
 */
export function ThemeColors({ colors }: { colors: Record<string, unknown> }) {
  useEffect(() => {
    if (typeof window === 'undefined' || window.parent === window) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; page?: string; sectionKey?: string; draftContent?: Record<string, unknown> };
      if (!data || data.type !== 'CMS_DRAFT_PREVIEW' || data.page !== THEME_PAGE || data.sectionKey !== 'colors') return;
      const root = document.documentElement;
      for (const [name, value] of Object.entries(themeToCssVariables(data.draftContent ?? {}))) {
        root.style.setProperty(name, value);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const css = themeToCss(colors);
  return css ? <style data-theme-colors dangerouslySetInnerHTML={{ __html: css }} /> : null;
}
