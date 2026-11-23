import { createCmsRouteHandler } from '@brainicon/storio-elements-editor/next';

import { cmsPages } from '@/cms/pages';
import { getCmsStorage } from '@/lib/cms-storage';
import { loadNotice, loadNotices, saveDemoNoticeEdit } from '@/lib/notices';
import { resolveTenant } from '@/lib/tenant';

/**
 * ============================================================================
 * CMS API of this template (/api/cms/...)
 * ============================================================================
 * - Visitors' browsers read published content here (all modes).
 * - Writes, drafts and collections are allowed ONLY in Standalone Preview under
 *   `next dev`, for the local studio at /admin/cms.
 * - For a tenant this route is read-only: the Storio dashboard saves edits
 *   straight to the tenant's Storio backend.
 * ============================================================================
 */

async function handler() {
  const ctx = await resolveTenant();
  const canEdit = ctx.isStandalone && process.env.NODE_ENV === 'development';

  return createCmsRouteHandler({
    storage: await getCmsStorage(),
    allowedPages: cmsPages.map((p) => p.key),
    authorize: () => canEdit,
    getUserName: () => 'local-developer',
    collections: {
      notices: {
        async list() {
          const notices = await loadNotices(ctx);
          return notices.map((n) => ({ id: String(n.id), label: n.title, params: { id: String(n.id) } }));
        },
        async get(id) {
          const notice = await loadNotice(id, ctx);
          return notice ? { title: notice.title, content: notice.content ?? '' } : null;
        },
        async save(id, values) {
          await saveDemoNoticeEdit(id, values);
        },
      },
    },
  });
}

export async function GET(request: Request) {
  return (await handler()).GET(request);
}

export async function PUT(request: Request) {
  return (await handler()).PUT(request);
}

export async function DELETE(request: Request) {
  return (await handler()).DELETE(request);
}

export async function POST(request: Request) {
  return (await handler()).POST(request);
}
