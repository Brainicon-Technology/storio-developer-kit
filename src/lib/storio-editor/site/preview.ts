'use client';

import { useEffect, useState } from 'react';
import { CMS_MESSAGE, EDIT_MODE_PARAM, PREVIEW_PARAM, listenForCmsMessages } from '../core/messages';

function hasParam(name: string): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has(name);
}

/** True when the current page is rendered inside the studio's preview iframe. */
export function isCmsPreview(): boolean {
  return hasParam(PREVIEW_PARAM) || hasParam(EDIT_MODE_PARAM);
}

/**
 * Whether hover-to-edit is on. Starts from the `cms_edit_mode` URL flag and then
 * follows the studio's Edit/View toggle (SET_CMS_EDIT_MODE messages).
 */
export function useCmsEditMode(origins: string[]): boolean {
  const [isEditMode, setIsEditMode] = useState(false);
  const originsKey = origins.join('|');

  useEffect(() => {
    setIsEditMode(hasParam(EDIT_MODE_PARAM));
    // Only a page that is inside an iframe can be controlled by the studio.
    if (typeof window === 'undefined' || window.parent === window) return;
    return listenForCmsMessages(
      (message) => {
        if (message.type === CMS_MESSAGE.SET_EDIT_MODE) setIsEditMode(Boolean(message.enabled));
      },
      { origins, source: () => window.parent }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originsKey]);

  return isEditMode;
}
