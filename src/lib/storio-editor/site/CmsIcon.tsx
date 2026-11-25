'use client';

import React from 'react';
import type { IconComponent } from '../core/types';
import { useCmsConfig } from './CmsProvider';

export interface CmsIconProps {
  /** Icon name saved in the content, a key of `icons` in your CMS config. */
  name: string | undefined;
  /** Drawn when the name is not in `icons`. Default: nothing. */
  fallback?: IconComponent;
  className?: string;
  [prop: string]: unknown;
}

const warned = new Set<string>();

/**
 * Draws an editable icon by name from the `icons` map of your CMS config, the same list
 * the icon picker offers, so an icon picked in the editor always shows on the site.
 */
export const CmsIcon: React.FC<CmsIconProps> = ({ name, fallback, ...props }) => {
  const icons = useCmsConfig().icons;
  const Icon = (name && icons?.[name]) || fallback;
  if (!Icon) {
    if (name && !warned.has(name)) {
      warned.add(name);
      console.warn(
        icons
          ? `[storio-editor] <CmsIcon name="${name}">: "${name}" is not in the icons of your CMS config.`
          : '[storio-editor] <CmsIcon> needs an `icons` map in defineCms({ ... }).'
      );
    }
    return null;
  }
  const Component = Icon as React.ComponentType<Record<string, unknown>>;
  return <Component aria-hidden="true" {...props} />;
};
