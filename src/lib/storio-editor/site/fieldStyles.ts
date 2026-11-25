'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { CmsStorageAdapter, FieldStyle, StyleSheetData } from '../core/types';
import { STYLES_KEY } from '../core/styles';
import { CMS_MESSAGE, listenForCmsMessages } from '../core/messages';
import { isCmsPreview } from './preview';

/**
 * Field styles on the site: the published "_styles" record of each page (server-rendered through
 * initialContent, or fetched once when the page was not loaded on the server), plus the unsaved
 * styles the studio sends while an editor works in the Style tab.
 */
export interface FieldStyleStore {
  get(page: string, section: string, path: string): FieldStyle | undefined;
  /** Make sure a page's styles are loaded (fetches only when the server did not provide them). */
  request(page: string): void;
  subscribe(listener: () => void): () => void;
  version(): number;
  /** Start listening to the studio. Returns the stop function. */
  connect(origins: string[]): () => void;
}

const draftKey = (page: string, section: string, path: string) => `${page}\u0000${section}\u0000${path}`;

export function createFieldStyleStore(
  adapter: CmsStorageAdapter,
  initialContent: Record<string, Record<string, unknown>>
): FieldStyleStore {
  const sheets = new Map<string, StyleSheetData>();
  const requested = new Set<string>();
  const drafts = new Map<string, FieldStyle | null>();
  const listeners = new Set<() => void>();
  let version = 0;

  for (const [page, content] of Object.entries(initialContent)) {
    const sheet = content?.[STYLES_KEY];
    if (sheet && typeof sheet === 'object') sheets.set(page, sheet as StyleSheetData);
  }

  const notify = () => {
    version += 1;
    listeners.forEach((listener) => listener());
  };

  const load = async (page: string) => {
    try {
      const record = await adapter.getRecord(page, STYLES_KEY, { includeDrafts: isCmsPreview() });
      const content = record?.content;
      sheets.set(page, content && typeof content === 'object' ? (content as StyleSheetData) : {});
      notify();
    } catch {
      // Keep what we have; styles are decoration, never a reason to break the page.
    }
  };

  return {
    get(page, section, path) {
      const key = draftKey(page, section, path);
      if (drafts.has(key)) return drafts.get(key) ?? undefined;
      return sheets.get(page)?.[section]?.[path];
    },
    request(page) {
      if (requested.has(page)) return;
      requested.add(page);
      // Content loaded on the server already carries the page's styles (or their absence).
      if (Object.prototype.hasOwnProperty.call(initialContent, page)) return;
      void load(page);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    version: () => version,
    connect(origins) {
      if (typeof window === 'undefined' || window.parent === window || origins.length === 0) return () => undefined;
      return listenForCmsMessages(
        (message) => {
          if (message.type === CMS_MESSAGE.STYLE_DRAFT) {
            drafts.set(draftKey(message.page, message.sectionKey, message.path), message.style);
            notify();
          } else if (message.type === CMS_MESSAGE.CONTENT_UPDATED) {
            drafts.clear();
            const pages = new Set([...requested, ...sheets.keys()]);
            if (pages.size === 0) notify();
            pages.forEach((page) => void load(page));
          }
        },
        { origins, source: () => window.parent }
      );
    },
  };
}

/** The current style of one field, following drafts from the studio. */
export function useStoredFieldStyle(store: FieldStyleStore, page: string | undefined, section: string, path: string): FieldStyle | undefined {
  useEffect(() => {
    if (page) store.request(page);
  }, [store, page]);
  useSyncExternalStore(store.subscribe, store.version, store.version);
  return page ? store.get(page, section, path) : undefined;
}
