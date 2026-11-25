import { djangoAdapter } from '@/lib/storio-editor';
import { resolveTenant } from '@/lib/tenant'; // the TENANT_HOST helper of this template

// Same backend URL the Storio SDK uses on the server.
const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://127.0.0.1:8000';

/** Server-side reads of this school's published content (the tenant comes from the request). */
export async function serverCmsStorage() {
  const { tenantHost } = await resolveTenant();
  return djangoAdapter({
    baseUrl: `${BACKEND_URL.replace(/\/+$/, '')}/api/cms`,
    credentials: 'omit',
    media: false,
    headers: { 'x-tenant-host': tenantHost },
  });
}
