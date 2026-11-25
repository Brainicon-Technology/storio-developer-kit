import type { PageDef, SectionDetail, SectionMetadata, SectionRecord } from './types';

function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Full content of a page: its defaults, with each saved override replacing its
 * section. Unpublished overrides are applied only when `includeDrafts` is true.
 */
export function mergePageContent<T = Record<string, unknown>>(
  page: PageDef,
  records: SectionRecord[],
  options: { includeDrafts?: boolean } = {}
): T {
  const result = clone(page.defaults) as Record<string, unknown>;
  for (const record of records) {
    if (record.page !== page.key) continue;
    if (!options.includeDrafts && !record.isPublished) continue;
    if (record.content !== null && record.content !== undefined) {
      result[record.sectionKey] = clone(record.content);
    }
  }
  return result as T;
}

/** Every editable section key of a page: its defaults' keys, then any extra declared sections. */
export function getSectionKeys(page: PageDef): string[] {
  const keys = Object.keys(page.defaults);
  for (const section of page.sections) {
    if (!keys.includes(section.key)) keys.push(section.key);
  }
  return keys;
}

/** Metadata for every editable section of the given pages. */
export function listManagedSections(pages: PageDef[], records: SectionRecord[]): SectionMetadata[] {
  const byKey = new Map<string, SectionRecord>();
  for (const record of records) byKey.set(`${record.page}\u0000${record.sectionKey}`, record);

  const list: SectionMetadata[] = [];
  for (const page of pages) {
    for (const sectionKey of getSectionKeys(page)) {
      const record = byKey.get(`${page.key}\u0000${sectionKey}`);
      list.push({
        page: page.key,
        sectionKey,
        hasCustomOverride: Boolean(record),
        isPublished: record ? record.isPublished : true,
        updatedAt: record ? record.updatedAt : null,
        updatedBy: record?.updatedBy ?? null,
      });
    }
  }
  return list;
}

/**
 * One section as the editor sees it: the saved override (draft or published) if
 * there is one, otherwise the default. Returns null for an unknown section.
 */
export function getSectionDetail<T = unknown>(
  page: PageDef,
  sectionKey: string,
  record: SectionRecord | null
): SectionDetail<T> | null {
  const hasDefault = Object.prototype.hasOwnProperty.call(page.defaults, sectionKey);
  const declared = page.sections.some((s) => s.key === sectionKey);
  if (!record && !hasDefault && !declared) return null;

  const content = record && record.content !== null && record.content !== undefined
    ? record.content
    : page.defaults[sectionKey] ?? {};

  return {
    page: page.key,
    sectionKey,
    content: clone(content) as T,
    hasCustomOverride: Boolean(record),
    isPublished: record ? record.isPublished : true,
    updatedAt: record ? record.updatedAt : null,
    updatedBy: record?.updatedBy ?? null,
  };
}
