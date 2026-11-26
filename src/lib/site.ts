import { storio, type StorioNavigationItem, type StorioSettingsResponse } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
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
    navigation: withDemoFallback(navigation?.items, DEFAULT_DEMO_DATA.navigation, ctx.isStandalone),
  };
}
