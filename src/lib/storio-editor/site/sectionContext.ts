'use client';

import { createContext } from 'react';

export interface CmsSectionContextValue {
  sectionKey: string;
  /** Page the section belongs to when it is not the open page (e.g. the global page). */
  page?: string;
  /** True when this section shows its edit controls in the studio preview. */
  isEditMode: boolean;
  /** Origins allowed to receive preview messages. */
  origins: string[];
}

/** Lets every <CmsField> share its section's state instead of listening for messages itself. */
export const CmsSectionContext = createContext<CmsSectionContextValue | null>(null);

/** Above anything a page can reasonably use, so sticky headers never cover the edit buttons. */
export const EDIT_BUTTON_Z_INDEX = 2147483000;

type HideField = () => void;

let activeField: HideField | null = null;
const fieldHoverListeners = new Set<() => void>();

function notifyFieldHover() {
  fieldHoverListeners.forEach((listener) => listener());
}

/** Makes this field the only one showing a pencil and hides the previous one. */
export function claimFieldHover(hide: HideField) {
  if (activeField === hide) return;
  const previous = activeField;
  activeField = hide;
  previous?.();
  notifyFieldHover();
}

export function releaseFieldHover(hide: HideField) {
  if (activeField !== hide) return;
  activeField = null;
  notifyFieldHover();
}

export function isFieldHoverActive() {
  return activeField !== null;
}

export function subscribeToFieldHover(listener: () => void) {
  fieldHoverListeners.add(listener);
  return () => {
    fieldHoverListeners.delete(listener);
  };
}
