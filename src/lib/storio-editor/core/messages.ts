import type { FieldStyle } from './types';

/**
 * Messages exchanged between the studio (parent window) and the public page in
 * the preview iframe. Names are part of the public protocol; keep them stable.
 */
export const CMS_MESSAGE = {
  /** iframe -> studio: a section's, a single field's or a record field's edit button was clicked. */
  EDIT_SECTION: 'CMS_EDIT_SECTION',
  /** studio -> iframe: scroll to and highlight a section. */
  SCROLL_TO_SECTION: 'SCROLL_TO_SECTION',
  /** studio -> iframe: show or hide the edit affordances. */
  SET_EDIT_MODE: 'SET_CMS_EDIT_MODE',
  /** studio -> iframe: unsaved form content to render immediately. */
  DRAFT_PREVIEW: 'CMS_DRAFT_PREVIEW',
  /** studio -> iframe: content was saved or reset, fetch it again. */
  CONTENT_UPDATED: 'CMS_CONTENT_UPDATED',
  /** studio -> iframe: unsaved values of a collection record, to render immediately. */
  ITEM_DRAFT: 'CMS_ITEM_DRAFT',
  /** studio -> iframe: unsaved style of one field (null clears it), to render immediately. */
  STYLE_DRAFT: 'CMS_STYLE_DRAFT',
} as const;

/** Query flag that marks a page as loaded inside the studio. */
export const PREVIEW_PARAM = 'cms_preview';
/** Query flag that turns the hover-to-edit buttons on. */
export const EDIT_MODE_PARAM = 'cms_edit_mode';

export type CmsMessage =
  | {
      type: typeof CMS_MESSAGE.EDIT_SECTION;
      sectionKey: string;
      /** Page the section belongs to, e.g. the global page for a navbar. Default: the open page. */
      page?: string;
      title?: string;
      fieldPath?: string;
      /** What the clicked field shows, found from its element: an image, or text and the rest. */
      fieldKind?: 'image' | 'icon' | 'text';
      /** Set when the field belongs to a collection record instead of a section. */
      collection?: string;
      item?: string;
    }
  | { type: typeof CMS_MESSAGE.SCROLL_TO_SECTION; sectionKey: string }
  | { type: typeof CMS_MESSAGE.SET_EDIT_MODE; enabled: boolean }
  | { type: typeof CMS_MESSAGE.DRAFT_PREVIEW; page: string; sectionKey: string; draftContent: unknown }
  | { type: typeof CMS_MESSAGE.CONTENT_UPDATED }
  | { type: typeof CMS_MESSAGE.ITEM_DRAFT; collection: string; item: string; values: Record<string, unknown> | null }
  | { type: typeof CMS_MESSAGE.STYLE_DRAFT; page: string; sectionKey: string; path: string; style: FieldStyle | null };

const MESSAGE_TYPES = new Set<string>(Object.values(CMS_MESSAGE));

export function isCmsMessage(data: unknown): data is CmsMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { type?: unknown }).type === 'string' &&
    MESSAGE_TYPES.has((data as { type: string }).type)
  );
}

/** Origin of a URL, or null when it cannot be parsed. */
export function originOf(url: string | undefined | null, base?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url, base).origin;
  } catch {
    return null;
  }
}

/** The current window's origin plus any extra allowed origins, de-duplicated. */
export function trustedOrigins(extra: (string | null | undefined)[] = []): string[] {
  const set = new Set<string>();
  if (typeof window !== 'undefined') set.add(window.location.origin);
  for (const value of extra) {
    const origin = originOf(value ?? undefined);
    if (origin) set.add(origin);
  }
  return Array.from(set);
}

/**
 * Send a message to another window, once per trusted origin. The browser drops
 * the copies whose origin does not match the target, so content never leaks to
 * an unexpected page (unlike posting with "*").
 */
export function postCmsMessage(target: Window | null | undefined, message: CmsMessage, origins: string[]): void {
  if (!target) return;
  // Clone so the receiver never shares references with the sender's state.
  const payload = JSON.parse(JSON.stringify(message)) as CmsMessage;
  for (const origin of origins) {
    try {
      target.postMessage(payload, origin);
    } catch {
      // Ignore invalid origins.
    }
  }
}

/** Subscribe to CMS messages from trusted origins (and optionally one source window). */
export function listenForCmsMessages(
  handler: (message: CmsMessage, event: MessageEvent) => void,
  options: { origins: string[]; source?: () => Window | null | undefined }
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const listener = (event: MessageEvent) => {
    if (!options.origins.includes(event.origin)) return;
    if (options.source) {
      const expected = options.source();
      if (expected && event.source !== expected) return;
    }
    if (!isCmsMessage(event.data)) return;
    handler(event.data, event);
  };
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}
