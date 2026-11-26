import manifest from '../../public/storio.template.json';

/**
 * ============================================================================
 * Routes of this template, and menu links saved under another template
 * ============================================================================
 * A school keeps its menus when it switches templates: the header menu (Theme
 * settings > navbarLinks) and the dashboard navigation (footer quick links)
 * may still point to the previous template's URLs (/notice, /blog...), which
 * would be 404s here. Two safeguards:
 *
 * 1. menuHref(): every menu link is mapped to this template's route, or
 *    dropped when this template has no such page.
 * 2. LEGACY_ROUTES are also redirects (next.config.ts), so old bookmarks and
 *    search results keep working.
 *
 * Adding a page? Add it to "editorPages" (every editable page is there). A page
 * that is not an editor page goes in OTHER_ROUTES.
 * ============================================================================
 */

/** Routes that are not editor pages ([slug] pages the editor does not support). */
const OTHER_ROUTES = ['/activities/[slug]', '/careers/[slug]', '/forms/[code]', '/page/[slug]'];

/**
 * URLs used by an earlier Storio template (seen in real school menus) -> the page of this template
 * that shows the same thing. Adjust it to your own routes; a link with no entry is simply left out.
 */
export const LEGACY_ROUTES: Record<string, string> = {
  '/notice': '/notices',
  '/blog': '/blogs',
  '/event': '/events',
  '/career': '/careers',
  '/examResults': '/results',
  '/results/publicExam': '/results',
  '/results/schoolExam': '/results',
  '/personnel': '/staff',
  '/personnel/teachers': '/staff',
  '/personnel/staff': '/about',
  '/about/institution': '/about',
  '/about/schoolInfo': '/about',
  '/about/administrator': '/about',
  '/gallery/photos': '/gallery',
  '/gallery/videos': '/gallery',
};

const editorRoutes = ((manifest as { editorPages?: { route?: string }[] }).editorPages ?? [])
  .map((page) => page.route)
  .filter((route): route is string => typeof route === 'string');

const ROUTE_PATTERNS = [...new Set([...editorRoutes, ...OTHER_ROUTES])].map(
  (route) => new RegExp(`^${route.replace(/\[[^\]]+\]/g, '[^/]+').replace(/\/$/, '')}/?$`),
);

/** True when this template has a page at this path ("/blogs/my-post" matches "/blogs/[slug]"). */
export function isTemplateRoute(path: string): boolean {
  return ROUTE_PATTERNS.some((pattern) => pattern.test(path || '/'));
}

/**
 * The link to use for a menu entry: external links and this template's routes unchanged, a known
 * old URL mapped to its new page, anything else null (leave it out of the menu).
 */
export function menuHref(href: string): string | null {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (!href.startsWith('/')) return null;
  const [path, rest = ''] = href.split(/(?=[?#])/);
  const clean = path.length > 1 ? path.replace(/\/$/, '') : path;
  if (isTemplateRoute(clean)) return clean + rest;
  return LEGACY_ROUTES[clean] ?? null;
}

interface MenuLink {
  href: string;
  subLinks?: MenuLink[];
}

/**
 * Applies menuHref to a menu: drops links without a page, and sub-links that now point to the
 * same page as their parent or as an earlier sub-link.
 */
export function cleanMenu<T extends MenuLink>(links: T[]): T[] {
  return links.flatMap((link) => {
    const href = menuHref(link.href);
    if (!href) return [];
    const seen = new Set([href]);
    const subLinks = cleanMenu(link.subLinks ?? []).filter((sub) => !seen.has(sub.href) && seen.add(sub.href));
    return [{ ...link, href, subLinks }];
  });
}
