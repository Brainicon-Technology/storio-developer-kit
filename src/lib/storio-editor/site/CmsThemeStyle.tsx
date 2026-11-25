'use client';

import React from 'react';
import { themeToCss } from '../core/theme';
import { useSiteContent } from './CmsProvider';

export interface CmsThemeStyleProps {
  /** Section of the global page that holds the theme. Default: "theme". */
  section?: string;
  /** Start of every variable name. Default: "--", so primaryColor becomes --primary-color. */
  prefix?: string;
  /** Where the variables apply. Default: ":root". */
  selector?: string;
}

/**
 * Writes the theme section of the global page as CSS variables, for example
 * `:root{--primary-color:#7c3aed;--heading-font:Inter;}`. Put it once in the root layout, inside
 * <CmsProvider>, and use the variables in your CSS. Colour changes show in the studio preview as
 * the editor picks them.
 */
export const CmsThemeStyle: React.FC<CmsThemeStyleProps> = ({ section = 'theme', prefix, selector }) => {
  const site = useSiteContent<Record<string, unknown>>();
  const css = themeToCss(site[section], { prefix, selector });
  if (!css) return null;
  return <style data-cms-theme={section} dangerouslySetInnerHTML={{ __html: css }} />;
};
