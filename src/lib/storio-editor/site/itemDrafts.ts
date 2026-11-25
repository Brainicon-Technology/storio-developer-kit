'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { CMS_MESSAGE, listenForCmsMessages } from '../core/messages';
import { useCmsContext } from './CmsProvider';

/**
 * Unsaved values of collection records sent by the studio while an editor types. One listener
 * serves every field on the page.
 */
const drafts = new Map<string, Record<string, unknown>>();
const listeners = new Set<() => void>();
let stopListening: (() => void) | null = null;
let listeningFor = '';

const keyOf = (collection: string, item: string) => `${collection}\u0000${item}`;

function notify() {
  listeners.forEach((listener) => listener());
}

function ensureListening(origins: string[]) {
  if (typeof window === 'undefined' || window.parent === window || origins.length === 0) return;
  const key = origins.join('|');
  if (key === listeningFor) return;
  stopListening?.();
  listeningFor = key;
  stopListening = listenForCmsMessages(
    (message) => {
      if (message.type !== CMS_MESSAGE.ITEM_DRAFT) return;
      const draftKey = keyOf(message.collection, String(message.item));
      if (message.values) drafts.set(draftKey, message.values);
      else drafts.delete(draftKey);
      notify();
    },
    { origins, source: () => window.parent }
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The unsaved values the studio sent for one record, or undefined. */
export function useItemDraft(collection: string, item: string): Record<string, unknown> | undefined {
  const { origins } = useCmsContext();
  const originsKey = origins.join('|');
  useEffect(() => {
    ensureListening(origins);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originsKey]);
  return useSyncExternalStore(
    subscribe,
    () => drafts.get(keyOf(collection, item)),
    () => undefined
  );
}

/**
 * A collection record as the page should show it: the values you loaded (from your database
 * or API), with the editor's unsaved changes laid over them while the studio preview is open.
 * Visitors always get `values` unchanged.
 *
 *   const post = useCollectionItem('blog', props.post.slug, props.post);
 */
export function useCollectionItem<T extends Record<string, unknown>>(collection: string, item: string | number, values: T): T {
  const draft = useItemDraft(collection, String(item));
  return draft ? ({ ...values, ...draft } as T) : values;
}
