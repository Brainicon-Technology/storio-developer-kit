'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CmsConfig } from '../core/types';
import { findGlobalPage, findPage } from '../core/defineCms';
import { mergePageContent } from '../core/merge';
import { CMS_MESSAGE, listenForCmsMessages, trustedOrigins } from '../core/messages';
import { isCmsPreview } from './preview';
import { createFieldStyleStore, type FieldStyleStore } from './fieldStyles';

interface CmsContextValue {
  config: CmsConfig;
  /** Server-rendered content per page key, used before the client fetch completes. */
  initialContent: Record<string, Record<string, unknown>>;
  /** Origins allowed to send preview messages to this page. */
  origins: string[];
  /** Field styles (Style tab), published and unsaved. */
  styles: FieldStyleStore;
}

const CmsContext = createContext<CmsContextValue | null>(null);

export interface CmsProviderProps {
  config: CmsConfig;
  /**
   * Content already loaded on the server (e.g. with `getPageContent` from
   * "@/lib/storio-editor/server"), keyed by page key. Avoids a flash of default content.
   */
  initialContent?: Record<string, Record<string, unknown>>;
  children: React.ReactNode;
}

/** Makes the CMS configuration available to `usePageContent` and `CmsSection`. */
export const CmsProvider: React.FC<CmsProviderProps> = ({ config, initialContent, children }) => {
  const [origins, setOrigins] = useState<string[]>([]);

  // window is only available after mount; computing origins here keeps SSR output stable.
  useEffect(() => {
    setOrigins(trustedOrigins(config.allowedOrigins ?? []));
  }, [config.allowedOrigins]);

  // One store per provider; it reads the "_styles" record of each page from initialContent.
  const styles = useMemo(() => createFieldStyleStore(config.adapter, initialContent ?? {}), [config.adapter, initialContent]);
  const originsKey = origins.join('|');
  useEffect(() => styles.connect(origins), [styles, originsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<CmsContextValue>(
    () => ({ config, initialContent: initialContent ?? {}, origins, styles }),
    [config, initialContent, origins, styles]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
};

export function useCmsContext(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('[storio-editor] Wrap your site in <CmsProvider config={...}> before using CMS hooks.');
  }
  return ctx;
}

/** The CMS configuration passed to the nearest CmsProvider. */
export function useCmsConfig(): CmsConfig {
  return useCmsContext().config;
}

/**
 * Live content for a page: defaults overlaid by published overrides. Inside the
 * studio preview it also applies unsaved edits as you type and refetches after a save.
 */
export function usePageContent<T = Record<string, any>>(
  pageKey: string,
  options: {
    /** Content loaded on the server for this page (e.g. with `getPageContent`). */
    initialData?: T;
  } = {}
): T {
  const { config, initialContent, origins } = useCmsContext();
  const page = findPage(config, pageKey);
  if (!page) {
    throw new Error(`[storio-editor] Unknown page "${pageKey}". Add it to the "pages" array of your CMS config.`);
  }

  const [content, setContent] = useState<T>(
    () =>
      options.initialData ??
      (initialContent[pageKey] as T | undefined) ??
      mergePageContent<T>(page, [])
  );
  const originsKey = origins.join('|');

  useEffect(() => {
    let isMounted = true;
    // In the studio preview, ask for drafts too; the server only returns them to authorised users.
    const includeDrafts = isCmsPreview();

    const fetchPage = async () => {
      try {
        const records = await config.adapter.listRecords(pageKey, { includeDrafts });
        if (isMounted) setContent(mergePageContent<T>(page, records, { includeDrafts }));
      } catch {
        // Keep the current content (defaults or server-rendered) when storage is unreachable.
      }
    };

    fetchPage();

    if (typeof window === 'undefined' || window.parent === window || origins.length === 0) {
      return () => {
        isMounted = false;
      };
    }

    const unsubscribe = listenForCmsMessages(
      (message) => {
        if (message.type === CMS_MESSAGE.CONTENT_UPDATED) {
          fetchPage();
        } else if (message.type === CMS_MESSAGE.DRAFT_PREVIEW && message.page === pageKey) {
          // Real-time draft preview inside the studio without touching storage or live visitors.
          setContent((prev) => ({
            ...(prev as Record<string, unknown>),
            [message.sectionKey]: message.draftContent,
          }) as T);
        }
      },
      { origins, source: () => window.parent }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, config.adapter, originsKey]);

  return content;
}

/**
 * Live content of the global page (the one with `global: true`): header, footer, contact details,
 * SEO defaults, theme. Works on every page, and follows the editor's typing in the studio preview.
 */
export function useSiteContent<T = Record<string, any>>(options: { initialData?: T } = {}): T {
  const { config } = useCmsContext();
  const globalPage = findGlobalPage(config);
  if (!globalPage) {
    throw new Error('[storio-editor] useSiteContent needs a page with global: true in the "pages" array of your CMS config.');
  }
  return usePageContent<T>(globalPage.key, options);
}
