import { cache } from 'react';
import { headers } from 'next/headers';

/**
 * ============================================================================
 * Tenant resolution (use this everywhere; never copy the logic)
 * ============================================================================
 * Decides which Storio tenant a request belongs to, and whether the template
 * runs in Standalone Preview mode.
 *
 * - Standalone Preview: localhost AND no tenant linked with `storio link`.
 *   Data comes from the demo tenant, and empty results may fall back to
 *   DEFAULT_DEMO_DATA (see withDemoFallback in ./data.ts).
 * - Linked tenant (`storio link` sets NEXT_PUBLIC_STORIO_TENANT_HOST):
 *   real tenant data only.
 * - Live tenant domain: the request host is the tenant. Real data only.
 * ============================================================================
 */

export interface TenantContext {
  /** Host of the incoming request, without the port. */
  host: string;
  /** Tenant host to pass to the SDK and the CMS storage. */
  tenantHost: string;
  /** True only on localhost with no linked tenant. */
  isStandalone: boolean;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const DEMO_TENANT_HOST = 'demo.storio.cloud';

/**
 * Wrapped in React cache(): one TenantContext object per request. Loaders wrapped in cache() too
 * (loadNotice, loadLayout...) then run once per request, even when generateMetadata and the page
 * both call them.
 */
export const resolveTenant = cache(async function resolveTenant(): Promise<TenantContext> {
  const headersList = await headers();
  const rawHost = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host = rawHost.split(':')[0];

  const linkedTenant = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST;
  const isStandalone = LOCAL_HOSTS.has(host) && !linkedTenant;
  const tenantHost = linkedTenant || (isStandalone ? DEMO_TENANT_HOST : host);

  return { host, tenantHost, isStandalone };
});
