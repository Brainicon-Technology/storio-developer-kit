import { notFound } from 'next/navigation';

import { DevStudio } from '@/components/cms/DevStudio';
import { resolveTenant } from '@/lib/tenant';

/**
 * Local editor for template developers (Standalone Preview + `next dev` only).
 * Use it to check that every field has its pencil and that edits show up.
 * Real tenants edit from the Storio dashboard; this route is a 404 for them.
 */
export default async function DevStudioPage() {
  const { isStandalone } = await resolveTenant();
  if (!isStandalone || process.env.NODE_ENV !== 'development') notFound();
  return <DevStudio />;
}
