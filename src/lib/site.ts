import { storio, type StorioNavigationItem, type StorioSettingsResponse } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { menuHref } from './routes';
import type { TenantContext } from './tenant';
import { themeFromConfig, type ThemeValues } from './theme';

/**
 * The school's own settings (name, logo, contact details, social links), loaded with the SDK.
 * This is school data, edited on the dashboard's settings pages: it gets no editor pencil.
 */
export async function loadSettings(ctx: TenantContext): Promise<StorioSettingsResponse | null> {
  const real = await storio.getSettings(ctx.tenantHost).catch(() => null);
  return withDemoRecord(real, DEFAULT_DEMO_DATA.settings, ctx.isStandalone);
}

export interface SiteLayout {
  settings: StorioSettingsResponse | null;
  theme: ThemeValues;
  /** The dashboard's own menu (Settings > Navigation), shown as the footer's quick links. */
  navigation: StorioNavigationItem[];
}

/**
 * Everything the header and footer need, in one request: storio.getLayout returns the settings,
 * the customization (Theme settings) and the navigation together.
 * If that fails (an older backend, a network error), the three single calls are used instead:
 * getSettings, getCustomization and getNavigation.
 */
export async function loadLayout(ctx: TenantContext): Promise<SiteLayout> {
  const layout = await safely(storio.getLayout(ctx.tenantHost));
  const [settings, customization, navigation] = layout
    ? [layout.settings, layout.customization, layout.navigation]
    : await Promise.all([
        safely(storio.getSettings(ctx.tenantHost)),
        safely(storio.getCustomization(ctx.tenantHost)),
        safely(storio.getNavigation(ctx.tenantHost)),
      ]);

  const hasSettings = !!settings && Object.keys(settings).length > 0;
  return {
    settings: withDemoRecord(hasSettings ? settings : null, DEFAULT_DEMO_DATA.settings, ctx.isStandalone),
    theme: themeFromConfig(customization?.config ?? {}),
    navigation: withDemoFallback(quickLinks(normalizeNavigation(navigation?.items)), DEFAULT_DEMO_DATA.navigation, ctx.isStandalone),
  };
}

/**
 * Footer quick links: the dashboard menu's links that exist in this template (old URLs are mapped,
 * see ./routes.ts), each page once.
 */
function quickLinks(items: StorioNavigationItem[]): StorioNavigationItem[] {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    const url = menuHref(item.url);
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [{ ...item, url }];
  });
}

/**
 * The SDK types navigation items as { label, url, children }, but the backend sends the same
 * shape as Theme settings links: { name, href, subLinks }. Accept both, and drop items without
 * a text or a link, so a menu entry with a missing field can never break the page.
 */
export function normalizeNavigation(items: unknown): StorioNavigationItem[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((raw): StorioNavigationItem[] => {
    if (!raw || typeof raw !== 'object') return [];
    const r = raw as Record<string, unknown>;
    const label = typeof r.label === 'string' ? r.label : typeof r.name === 'string' ? r.name : '';
    const url = typeof r.url === 'string' ? r.url : typeof r.href === 'string' ? r.href : '';
    if (!label || !url) return [];
    const id = typeof r.id === 'string' || typeof r.id === 'number' ? r.id : undefined;
    const target = typeof r.target === 'string' ? r.target : undefined;
    return [{ id, label, url, target, children: normalizeNavigation(r.children ?? r.subLinks) }];
  });
}
