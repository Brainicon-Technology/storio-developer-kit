import { EDIT_MODE_PARAM, PREVIEW_PARAM } from '../core/messages';

/**
 * True when a request is the studio's preview iframe loading a public page.
 * Use it in middleware so redirects (login walls, admin-host redirects, locale
 * redirects) let the preview through:
 *
 *   if (!isCmsPreviewRequest(request, { studioPath: '/admin/cms' })) { ...redirect... }
 *
 * This only decides whether to skip a redirect; it grants no access, since the
 * page shown is the same public page any visitor can load.
 */
export function isCmsPreviewRequest(
  request: { url: string; headers: Headers },
  options: { studioPath?: string } = {}
): boolean {
  const url = new URL(request.url);
  if (url.searchParams.has(PREVIEW_PARAM) || url.searchParams.has(EDIT_MODE_PARAM)) return true;
  if (request.headers.get('sec-fetch-dest') === 'iframe') return true;
  const referer = request.headers.get('referer');
  if (options.studioPath && referer) {
    try {
      return new URL(referer).pathname.startsWith(options.studioPath);
    } catch {
      return false;
    }
  }
  return false;
}
