import type { CmsStorageAdapter, SectionRecord } from '@brainicon/storio-elements-editor';
import { restAdapter } from '@brainicon/storio-elements-editor/adapters';
import { fileStorage } from '@brainicon/storio-elements-editor/next';

import { resolveTenant } from './tenant';

/**
 * ============================================================================
 * Where edited content is read from (server only)
 * ============================================================================
 * The one place that decides which store this request uses:
 *
 * - Standalone Preview: a local JSON file (.cms/content.json), so you can edit
 *   pages with the dev-only studio at /admin/cms.
 * - Linked or live tenant: the tenant's content in the Storio backend
 *   (STORIO_CMS_API_URL). The Storio dashboard writes there; the template only reads.
 *   Without STORIO_CMS_API_URL the pages show their defaults from src/content.
 * ============================================================================
 */

let localStorage: CmsStorageAdapter | undefined;

/** Read-only store with no saved edits: every page shows its defaults. */
const defaultsOnlyStorage: CmsStorageAdapter = {
  async listRecords(): Promise<SectionRecord[]> {
    return [];
  },
  async getRecord(): Promise<SectionRecord | null> {
    return null;
  },
  async saveRecord(): Promise<SectionRecord> {
    throw new Error('Content is edited from the Storio dashboard, not from the template.');
  },
  async deleteRecord(): Promise<void> {
    throw new Error('Content is edited from the Storio dashboard, not from the template.');
  },
};

export async function getCmsStorage(): Promise<CmsStorageAdapter> {
  const { tenantHost, isStandalone } = await resolveTenant();

  if (isStandalone) {
    localStorage ??= fileStorage();
    return localStorage;
  }

  const apiUrl = process.env.STORIO_CMS_API_URL;
  if (!apiUrl) return defaultsOnlyStorage;

  return restAdapter({
    baseUrl: apiUrl,
    headers: { 'X-Tenant-Host': tenantHost },
    media: false,
  });
}
