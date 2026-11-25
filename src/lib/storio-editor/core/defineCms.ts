import type { CmsConfig, PageDef } from './types';

const KEY_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

/** True for keys safe to use as page or section identifiers in storage and URLs. */
export function isValidKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

/**
 * Validate and return a CMS configuration. Throws on duplicate or malformed keys
 * so mistakes surface at startup instead of as silent save failures.
 */
export function defineCms(config: CmsConfig): CmsConfig {
  const seen = new Set<string>();
  for (const page of config.pages) {
    if (!isValidKey(page.key)) {
      throw new Error(`[storio-editor] Invalid page key "${page.key}". Use letters, digits, "_" or "-".`);
    }
    if (seen.has(page.key)) {
      throw new Error(`[storio-editor] Duplicate page key "${page.key}".`);
    }
    seen.add(page.key);
    if (!page.route.startsWith('/')) {
      throw new Error(`[storio-editor] Page "${page.key}" route must start with "/".`);
    }
    if (page.listOnEveryPage !== undefined && !page.global) {
      throw new Error(`[storio-editor] Page "${page.key}" has listOnEveryPage, which only applies to the page with global: true.`);
    }
    if (page.collection !== undefined && !isValidKey(page.collection)) {
      throw new Error(`[storio-editor] Invalid collection "${page.collection}" on page "${page.key}".`);
    }
    if (/\[[^\]]+\]/.test(page.route) && !page.collection) {
      throw new Error(
        `[storio-editor] Page "${page.key}" has the route "${page.route}", which shows one record at a time. ` +
          'Add collection: "<key>" so the studio can list the records.'
      );
    }
    const sectionKeys = new Set<string>();
    for (const section of page.sections) {
      if (section.key === '_styles') {
        throw new Error(`[storio-editor] Section key "_styles" on page "${page.key}" is reserved for field styles. Rename the section.`);
      }
      if (!isValidKey(section.key)) {
        throw new Error(`[storio-editor] Invalid section key "${section.key}" on page "${page.key}".`);
      }
      if (sectionKeys.has(section.key)) {
        throw new Error(`[storio-editor] Duplicate section key "${section.key}" on page "${page.key}".`);
      }
      sectionKeys.add(section.key);
    }
  }
  const globalPages = config.pages.filter((p) => p.global);
  if (globalPages.length > 1) {
    throw new Error(
      `[storio-editor] Only one page may have global: true (found ${globalPages.map((p) => `"${p.key}"`).join(', ')}).`
    );
  }
  const globalPage = globalPages[0];
  if (globalPage) {
    if (globalPage.collection || globalPage.parent) {
      throw new Error(`[storio-editor] The global page "${globalPage.key}" cannot have a collection or a parent.`);
    }
    const globalKeys = new Set(globalPage.sections.map((s) => s.key));
    for (const page of config.pages) {
      if (page === globalPage) continue;
      const clash = page.sections.find((s) => globalKeys.has(s.key));
      if (clash) {
        throw new Error(
          `[storio-editor] Section "${clash.key}" is on page "${page.key}" and on the global page "${globalPage.key}". ` +
            'Rename one, so the studio knows which one a click means.'
        );
      }
    }
  }
  for (const page of config.pages) {
    if (!page.parent) continue;
    const parent = config.pages.find((p) => p.key === page.parent);
    if (!parent) throw new Error(`[storio-editor] Page "${page.key}" has the parent "${page.parent}", which is not a page.`);
    if (parent.parent) {
      throw new Error(`[storio-editor] Page "${page.key}": its parent "${parent.key}" has a parent itself. Use one level only.`);
    }
    if (!page.collection) {
      throw new Error(`[storio-editor] Page "${page.key}" has a parent, so it must show records: add collection: "<key>".`);
    }
  }
  return config;
}

/** The page with `global: true` (site-wide content), if any. */
export function findGlobalPage(config: Pick<CmsConfig, 'pages'>): PageDef | undefined {
  return config.pages.find((p) => p.global);
}

/**
 * Which page a section belongs to, as seen from the page open in the studio: the page named by
 * the click, else the open page, else the global page.
 */
export function resolveSectionPage(
  config: Pick<CmsConfig, 'pages'>,
  currentPage: string,
  sectionKey: string,
  requestedPage?: string
): string | undefined {
  const has = (key: string | undefined) => !!key && !!findPage(config, key)?.sections.some((s) => s.key === sectionKey);
  if (requestedPage) return has(requestedPage) ? requestedPage : undefined;
  if (has(currentPage)) return currentPage;
  const globalPage = findGlobalPage(config);
  return globalPage && has(globalPage.key) ? globalPage.key : undefined;
}

export function findPage(config: Pick<CmsConfig, 'pages'>, pageKey: string): PageDef | undefined {
  return config.pages.find((p) => p.key === pageKey);
}
