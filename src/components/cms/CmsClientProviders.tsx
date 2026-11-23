'use client';

import { CmsProvider, CmsThemeStyle } from '@brainicon/storio-elements-editor/site';

import { cms } from '@/cms/config';

export function CmsClientProviders({
  initialContent,
  children,
}: {
  initialContent?: Record<string, Record<string, unknown>>;
  children: React.ReactNode;
}) {
  return (
    <CmsProvider config={cms} initialContent={initialContent}>
      {/* Writes the "theme" section of the site page as CSS variables (--primary-color, ...). */}
      <CmsThemeStyle />
      {children}
    </CmsProvider>
  );
}
