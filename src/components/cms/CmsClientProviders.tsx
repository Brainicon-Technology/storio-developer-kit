'use client';

import { CmsProvider } from '@/lib/storio-editor/site';
import { cms } from '@/cms.config';

export function CmsClientProviders({
  initialContent,
  children,
}: {
  initialContent?: Record<string, Record<string, unknown>>;
  children: React.ReactNode;
}) {
  return (
    <CmsProvider config={cms} initialContent={initialContent}>
      {children}
    </CmsProvider>
  );
}
