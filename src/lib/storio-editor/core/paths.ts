import { EDIT_MODE_PARAM, PREVIEW_PARAM } from './messages';

/** "items.0.title" becomes ["items", 0, "title"]. */
export function parseFieldPath(path: string): (string | number)[] {
  return path.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

/** The value at a field path, or undefined. Only the content's own values can be reached. */
export function getAtPath(data: unknown, path: (string | number)[]): unknown {
  let current = data;
  for (const part of path) {
    if (current === null || typeof current !== 'object') return undefined;
    if (Array.isArray(current) && typeof part !== 'number') return undefined;
    if (!Object.prototype.hasOwnProperty.call(current, part)) return undefined;
    current = (current as Record<string | number, unknown>)[part];
  }
  return current;
}

/** Absolute public URL of a route, using `publicSiteUrl` when the site runs on another origin. */
export function publicUrl(route: string, publicSiteUrl?: string): string {
  if (!publicSiteUrl) return route;
  return `${publicSiteUrl.replace(/\/+$/, '')}${route.startsWith('/') ? route : `/${route}`}`;
}

/** URL loaded in the studio's preview iframe. */
export function buildPreviewUrl(
  route: string,
  options: { publicSiteUrl?: string; editMode?: boolean; cacheBust?: number | string } = {}
): string {
  const base = publicUrl(route, options.publicSiteUrl);
  const params = [`${PREVIEW_PARAM}=1`];
  if (options.editMode) params.push(`${EDIT_MODE_PARAM}=1`);
  if (options.cacheBust !== undefined) params.push(`t=${encodeURIComponent(String(options.cacheBust))}`);
  return `${base}${base.includes('?') ? '&' : '?'}${params.join('&')}`;
}
