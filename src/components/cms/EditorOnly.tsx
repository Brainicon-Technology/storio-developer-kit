'use client';

import { useSyncExternalStore } from 'react';
import { isCmsPreview } from '@/lib/storio-editor/site';

const noSubscribe = () => () => {};

/**
 * True inside the Storio editor's preview, false for visitors.
 * The server renders false (it cannot see the preview URL flag); the browser switches to the real
 * value right after hydration, so server and browser HTML always match.
 */
export function useInEditor(): boolean {
  return useSyncExternalStore(noSubscribe, isCmsPreview, () => false);
}

/**
 * Pattern for a section that shows school data (testimonials, team...):
 *
 *   const inEditor = useInEditor();
 *   {(items.length > 0 || inEditor) && (
 *     <CmsSection ...>
 *       <h2><CmsField path="title">...</CmsField></h2>
 *       {items.length === 0 ? <EmptyInEditor source="Testimonials" /> : items.map(...)}
 *     </CmsSection>
 *   )}
 *
 * Visitors never see an empty section. In the editor the section stays, so the admin can still
 * edit its texts, and this note (shown only there) says where its data comes from.
 */
export function EmptyInEditor({ source }: { source: string }) {
  return (
    <p className="rounded-xl border border-dashed border-black/20 p-4 text-sm opacity-70">
      Shown only in the editor: this section is hidden on the site until the school adds data in the dashboard ({source}).
    </p>
  );
}
