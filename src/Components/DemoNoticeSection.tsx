import { storio, StorioNotice } from '@storio/template-sdk';
import { headers } from 'next/headers';
import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';

/**
 * ============================================================================
 * DemoNoticeSection Component
 * ============================================================================
 * This example component demonstrates how 3rd-party template developers MUST fetch
 * data using `@storio/template-sdk` while strictly adhering to Rule 1.
 * 
 * RULE 1 RECAP:
 * - Standalone Preview (localhost): If SDK data is empty, fallback to DEFAULT_DEMO_DATA
 *   so you can visually design and inspect your components locally.
 * - Live Tenant Domain (school.com): ONLY display real database data from the SDK.
 *   If the DB is empty, render a 0-item empty state (NEVER show demo data on live sites!).
 * ============================================================================
 */
export default async function DemoNoticeSection() {
  // --------------------------------------------------------------------------
  // STEP 1: Extract incoming request headers to determine the domain/host.
  // Storio SDK relies on host headers for multi-tenant routing.
  // --------------------------------------------------------------------------
  const headersList = await headers();
  const rawHost = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host = rawHost.split(':')[0]; // Remove port number if present (e.g. "localhost:3000" -> "localhost")

  // --------------------------------------------------------------------------
  // STEP 2: Determine Tenant Host and Standalone Preview vs Tenant Gateway Mode
  // - Linked Tenant Mode (via storio link / NEXT_PUBLIC_STORIO_TENANT_HOST):
  //   Uses the linked tenant host for local development. Treats as Tenant Gateway (Rule 1).
  // - Standalone Preview Mode (localhost with NO linked tenant):
  //   Uses mock data fallback so developers can preview and style unlinked components.
  // - Live Tenant Domain (production / gateway domain):
  //   Uses incoming request host. Real DB data only, 0-item empty state on empty DB.
  // --------------------------------------------------------------------------
  const linkedTenant = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  
  // Standalone mode is active ONLY if on localhost AND no tenant is linked via CLI
  const isStandalone = isLocalHost && !linkedTenant;
  const tenantHost = linkedTenant || (isStandalone ? 'demo.storio.cloud' : host);

  // --------------------------------------------------------------------------
  // STEP 3: Fetch notices from the Storio SDK.
  // Always type your variables with SDK interfaces (Rule 2: Zero `any` types!).
  // --------------------------------------------------------------------------
  const notices: StorioNotice[] | null = await storio.getNotices(tenantHost);

  // --------------------------------------------------------------------------
  // STEP 4: Apply the Tenant DB vs Standalone Mock Data Rule (Rule 1).
  // - Has DB Data? Use `notices`.
  // - Is Standalone (unlinked localhost) & DB empty? Fallback to `DEFAULT_DEMO_DATA.notices`.
  // - Is Tenant Gateway / Linked Tenant & DB empty? Use `[]` (empty array, NO mock data).
  // --------------------------------------------------------------------------
  const finalNotices: StorioNotice[] = (Array.isArray(notices) && notices.length > 0)
    ? notices
    : (isStandalone ? DEFAULT_DEMO_DATA.notices : []);

  // --------------------------------------------------------------------------
  // STEP 5: Render Empty State
  // When a live school database has 0 notices posted, show a clean empty state.
  // --------------------------------------------------------------------------
  if (!finalNotices || finalNotices.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded-md bg-white text-gray-500 text-sm">
        No public notices available.
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STEP 6: Render Notice Cards
  // Map through the strongly-typed `finalNotices` array.
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-4 bg-white">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-xl font-semibold text-gray-900">Latest Notices</h2>
        
        {/* Status Indicator showing active mode */}
        <span className="text-xs font-mono text-gray-500">
          Mode: {isStandalone ? 'Standalone Preview' : 'Tenant Gateway'}
        </span>
      </div>

      {/* Notice Items List */}
      <div className="space-y-3">
        {finalNotices.map((notice) => (
          <div key={notice.id} className="p-4 bg-white border border-gray-200 rounded-md">
            <div className="flex items-center justify-between">
              {/* Notice Title */}
              <h3 className="font-semibold text-gray-900">{notice.title}</h3>
              
              {/* Urgent Badge */}
              {notice.is_urgent && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded font-medium">
                  Urgent
                </span>
              )}
            </div>

            {/* Notice Body Content */}
            {notice.content && (
              <p className="text-sm text-gray-600 mt-2">{notice.content}</p>
            )}

            {/* Publication Date */}
            {notice.published_date && (
              <span className="text-xs text-gray-400 block mt-2">{notice.published_date}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
