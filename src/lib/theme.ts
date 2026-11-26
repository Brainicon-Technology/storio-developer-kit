import { cache } from 'react';
import { storio } from '@storio/template-sdk';

import manifest from '../../public/storio.template.json';
import { cleanMenu } from './routes';
import type { TenantContext } from './tenant';

/**
 * ============================================================================
 * Theme settings (the manifest's "customization" and "navigation" fields)
 * ============================================================================
 * School admins change these in the Storio editor under "Theme settings". The
 * published values come from the SDK (storio.getCustomization). A field the
 * school never changed falls back to its "default" in the manifest, so the
 * manifest stays the one place that lists these fields and their defaults.
 *
 * - colors:  become CSS variables (primaryColor -> --primary-color), see <ThemeColors>.
 * - content: texts shown with a <ThemeField> pencil (header button, footer texts).
 * - navigation.navbarLinks: the header menu.
 * ============================================================================
 */

interface ManifestField {
  id: string;
  default?: unknown;
}

export interface NavLink {
  id?: string;
  name: string;
  href: string;
  subLinks?: NavLink[];
}

export type ThemeValues = Record<string, unknown>;

/** Every customization and navigation field with its manifest default. */
function manifestDefaults(): ThemeValues {
  const out: ThemeValues = {};
  const groups = Object.values((manifest as { customization?: Record<string, ManifestField[]> }).customization ?? {});
  for (const field of [...groups.flat(), ...((manifest as { navigation?: ManifestField[] }).navigation ?? [])]) {
    if (field && typeof field.id === 'string') out[field.id] = field.default;
  }
  return out;
}

/** The school's Theme settings values, each falling back to its manifest default. */
export const loadTheme = cache(async function loadTheme(ctx: TenantContext): Promise<ThemeValues> {
  // revalidate: 0, so a saved Theme setting shows right away (see loadLayout in ./site.ts).
  const saved = (await storio.getCustomization({ tenantHost: ctx.tenantHost, next: { revalidate: 0 } }).catch(() => null))?.config ?? {};
  return themeFromConfig(saved);
});

/** Theme settings values from a customization config (getCustomization or getLayout), with manifest defaults. */
export function themeFromConfig(saved: Record<string, unknown>): ThemeValues {
  const defaults = manifestDefaults();
  const values: ThemeValues = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const value = saved[key];
    if (value !== undefined && value !== null && value !== '') values[key] = value;
  }
  return values;
}

/** A text value of the theme (empty string when missing). */
export function themeText(theme: ThemeValues, field: string): string {
  const value = theme[field];
  return typeof value === 'string' ? value : '';
}

/** The ids of the manifest's "colors" fields (these become CSS variables). */
export function themeColorFields(): string[] {
  const colors = (manifest as { customization?: { colors?: ManifestField[] } }).customization?.colors ?? [];
  return colors.map((field) => field.id);
}

/**
 * The header menu (Theme settings > Navigation). Links saved under another template are mapped
 * to this template's pages, or left out (cleanMenu in ./routes.ts), so the menu never links to a 404.
 */
export function themeNavLinks(theme: ThemeValues): NavLink[] {
  return cleanMenu(cleanLinks(theme.navbarLinks));
}

function cleanLinks(value: unknown): NavLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((link): link is NavLink => !!link && typeof link === 'object' && typeof link.name === 'string' && typeof link.href === 'string')
    .map((link) => ({ ...link, subLinks: cleanLinks(link.subLinks) }));
}
