import { cache } from 'react';
import { storio, type StorioNavigationItem, type StorioSettingsResponse } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { menuHref } from './routes';
import type { TenantContext } from './tenant';
import { themeFromConfig, type ThemeValues } from './theme';

export interface SiteLayout {
  /**
   * The school's own settings (name, logo, contact details, social links). School data, edited on
   * the dashboard's settings pages: it gets no editor pencil. Read it from here, not with a second
   * getSettings call: loadLayout runs once per request.
   */
  settings: StorioSettingsResponse | null;
  theme: ThemeValues;
  /** The dashboard's own menu (Settings > Navigation), shown as the footer's quick links. */
  navigation: MenuLink[];
}

/**
 * A menu link with its text and URL always present. StorioNavigationItem has every field optional
 * (the API sends { name, href, subLinks }, older backends { label, url, children }), so
 * normalizeNavigation() turns each item into this shape and drops items without a text or a link.
 */
export interface MenuLink {
  id?: string | number;
  label: string;
  url: string;
  target?: string;
  children: MenuLink[];
}

/**
 * Everything the header and footer need, in one request: storio.getLayout returns the settings,
 * the customization (Theme settings) and the navigation together.
 * If that fails (an older backend, a network error), the three single calls are used instead:
 * getSettings, getCustomization and getNavigation.
 *
 * Caching: SDK GET requests are cached for 60 seconds by default ({ next: { revalidate: 60 } }).
 * Menus, Theme settings and settings change rarely but should show right after the school saves
 * them, so these calls pass { tenantHost, next: { revalidate: 0 } } (every fetch option goes in the
 * same object as the tenant host).
 */
export const loadLayout = cache(async function loadLayout(ctx: TenantContext): Promise<SiteLayout> {
  const fresh = { tenantHost: ctx.tenantHost, next: { revalidate: 0 } };
  const layout = await safely(storio.getLayout(fresh));
  const [settings, customization, navigation] = layout
    ? [layout.settings, layout.customization, layout.navigation]
    : await Promise.all([safely(storio.getSettings(fresh)), safely(storio.getCustomization(fresh)), safely(storio.getNavigation(fresh))]);

  const hasSettings = !!settings && Object.keys(settings).length > 0;
  return {
    settings: withDemoRecord(hasSettings ? settings : null, DEFAULT_DEMO_DATA.settings, ctx.isStandalone),
    theme: themeFromConfig(customization?.config ?? {}),
    navigation: quickLinks(withDemoFallback(normalizeNavigation(navigation?.items), normalizeNavigation(DEFAULT_DEMO_DATA.navigation), ctx.isStandalone)),
  };
});

/**
 * Footer quick links: the dashboard menu's links that exist in this template (old URLs are mapped,
 * see ./routes.ts), each page once.
 */
function quickLinks(items: MenuLink[]): MenuLink[] {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    const url = menuHref(item.url);
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [{ ...item, url }];
  });
}

/**
 * storio.getNavigation().items -> StorioNavigationItem[]. The live API sends { name, href, subLinks }
 * (the same shape as Theme settings links), older backends { label, url, children }. Accept both,
 * skip hidden items, and drop items without a text or a link, so a menu entry with a missing field
 * can never break the page.
 */
export function normalizeNavigation(items: StorioNavigationItem[] | null | undefined): MenuLink[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item): MenuLink[] => {
    const label = item.name || item.label || '';
    const url = item.href || item.url || '';
    if (!label || !url || item.isVisible === false) return [];
    return [{ id: item.id, label, url, target: item.target, children: normalizeNavigation(item.subLinks ?? item.children) }];
  });
}
