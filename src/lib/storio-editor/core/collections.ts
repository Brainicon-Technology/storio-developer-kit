import type { CmsConfig, CollectionItemSummary, PageDef } from './types';

const BRACKET = /\[(?:\.\.\.)?([A-Za-z0-9_]+)\]/g;

/** True for routes with a [param] segment, such as "/blog/[slug]". */
export function isDynamicRoute(route: string): boolean {
  return /\[[^\]]+\]/.test(route);
}

/**
 * The public URL of one record: each [name] in the route is replaced by `item.params[name]`,
 * or by the id when there is no such param. "/blog/[slug]" + { id: "school" } -> "/blog/school".
 */
export function fillRoute(route: string, item: Pick<CollectionItemSummary, 'id' | 'params'>): string {
  return route.replace(BRACKET, (_, name: string) => encodeURIComponent(item.params?.[name] ?? item.id));
}

/** Pages shown in the studio's page menu: every page that does not belong to a parent page. */
export function topLevelPages(config: Pick<CmsConfig, 'pages'>): PageDef[] {
  return config.pages.filter((p) => !p.parent);
}

/** The top-level page a page is listed under (itself when it has no parent). */
export function groupPageOf(config: Pick<CmsConfig, 'pages'>, page: PageDef): PageDef {
  return (page.parent && config.pages.find((p) => p.key === page.parent)) || page;
}

/**
 * The pages whose records appear in the record menu of a top-level page: its children with a
 * collection, plus the page itself when it shows records.
 */
export function recordPagesOf(config: Pick<CmsConfig, 'pages'>, group: PageDef): PageDef[] {
  const children = config.pages.filter((p) => p.parent === group.key && p.collection);
  return group.collection ? [group, ...children] : children;
}
