'use client';

import { useEffect, useRef, useState } from 'react';
import { CmsField } from '@/lib/storio-editor/site';
import { THEME_PAGE } from './themePage';

/**
 * A pencil for a text the template reads from its customization (Theme settings), such as
 * "about_section_title". It opens that same Theme settings field in the editor, so the text has one
 * source: the published value goes into the live customization the template already reads.
 *
 * Live preview: the template renders these texts from the server's customization, which the
 * editor's typing does not reach. So inside the editor preview this listens for the editor's draft
 * messages itself and shows the typed value while it differs from the rendered text (untouched
 * fields keep their own markup); after a save or reset it reloads the preview to show the stored
 * value. Visitors see the children unchanged.
 */
export default function ThemeField({
  field,
  label,
  section = 'content',
  children,
}: {
  field: string;
  label?: string;
  section?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.parent === window || !ref.current) return;
    // The text as rendered from the customization (without a field style's <style>/<link>).
    const copy = ref.current.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('style, link, script').forEach((node) => node.remove());
    const rendered = (copy.textContent ?? '').trim();
    let hasDraft = false;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; page?: string; sectionKey?: string; draftContent?: Record<string, unknown> };
      if (!data || typeof data !== 'object') return;
      if (data.type === 'CMS_DRAFT_PREVIEW' && data.page === THEME_PAGE && data.sectionKey === section) {
        const value = data.draftContent?.[field];
        const next = typeof value === 'string' && value.trim() !== rendered ? value : null;
        hasDraft = next !== null;
        setDraft(next);
      } else if (data.type === 'CMS_CONTENT_UPDATED' && hasDraft) {
        window.location.reload();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [field, section]);

  // The measuring span sits outside CmsField: a field style (Style tab) must land on the field's own
  // box, never on a display: contents element, which cannot show spacing, background or alignment.
  return (
    <span ref={ref} style={{ display: 'contents' }}>
      <CmsField section={section} page={THEME_PAGE} path={field} label={label}>
        {draft !== null ? draft : children}
      </CmsField>
    </span>
  );
}
