/**
 * Storio editor support for this template: makes the template's texts, images, icons and page SEO
 * editable from the Storio dashboard (Template Customization), without installing a library.
 *
 * The code comes from the Storio Elements Editor (v1.4.0) and keeps its structure exactly:
 * pages and sections in cms.config.ts (defineCms), <CmsProvider>, <CmsSection>, <CmsField>,
 * usePageContent, and the /api/cms/ API with the editor's preview messages (core/messages.ts).
 * Keep those identical, or the Storio dashboard can no longer edit this template.
 *
 *   '@/lib/storio-editor'         config and storage: defineCms, djangoAdapter, types
 *   '@/lib/storio-editor/site'    client components: CmsProvider, CmsSection, CmsField, usePageContent...
 *   '@/lib/storio-editor/server'  server helpers: getAllPageContent, getPageMetadata...
 */
export * from './core/types';
export { defineCms, findPage, findGlobalPage, resolveSectionPage, isValidKey } from './core/defineCms';
export { mergePageContent } from './core/merge';
export { restAdapter, CmsRequestError } from './adapters/rest';
export type { RestAdapterOptions } from './adapters/rest';
export { djangoAdapter } from './adapters/django';
export type { DjangoAdapterOptions } from './adapters/django';
