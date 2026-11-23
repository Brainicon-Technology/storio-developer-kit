import { promises as fs } from 'fs';
import path from 'path';
import { storio, type StorioNotice } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { withDemoFallback, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/**
 * ============================================================================
 * Notices: tenant records loaded with @storio/template-sdk
 * ============================================================================
 * Notices are database records, not page content. Pages show them with
 * <CmsField collection="notices" item={id} path="title">, so an editor can
 * change a record's own fields.
 *
 * For a tenant, the Storio dashboard saves those edits to the tenant database.
 * In Standalone Preview there is no database, so edits made in the local
 * studio are kept in .cms/demo-notices.json and applied on top of the list.
 * ============================================================================
 */

/** The record fields the editor may change. */
export type EditableNotice = Pick<StorioNotice, 'title' | 'content'>;

const DEMO_EDITS_FILE = path.join(process.cwd(), '.cms', 'demo-notices.json');

async function readDemoEdits(): Promise<Record<string, Partial<EditableNotice>>> {
  try {
    const text = await fs.readFile(DEMO_EDITS_FILE, 'utf8');
    return JSON.parse(text) as Record<string, Partial<EditableNotice>>;
  } catch {
    return {};
  }
}

function applyEdits(notice: StorioNotice, edits: Record<string, Partial<EditableNotice>>): StorioNotice {
  const edit = edits[String(notice.id)];
  return edit ? { ...notice, ...edit } : notice;
}

export async function loadNotices(ctx: TenantContext): Promise<StorioNotice[]> {
  const real = await storio.getNotices(ctx.tenantHost);
  const notices = withDemoFallback(real, DEFAULT_DEMO_DATA.notices, ctx.isStandalone);
  if (!ctx.isStandalone) return notices;
  const edits = await readDemoEdits();
  return notices.map((n) => applyEdits(n, edits));
}

export async function loadNotice(id: string, ctx: TenantContext): Promise<StorioNotice | null> {
  const real = await storio.getNoticeDetail(id, ctx.tenantHost);
  const demo = DEFAULT_DEMO_DATA.notices.find((n) => String(n.id) === id);
  const notice = withDemoRecord(real, demo, ctx.isStandalone);
  if (!notice || !ctx.isStandalone) return notice;
  return applyEdits(notice, await readDemoEdits());
}

/** Standalone Preview only: keep an edit made in the local studio. */
export async function saveDemoNoticeEdit(id: string, values: Partial<EditableNotice>): Promise<void> {
  const edits = await readDemoEdits();
  const clean: Partial<EditableNotice> = {};
  if (typeof values.title === 'string') clean.title = values.title;
  if (typeof values.content === 'string') clean.content = values.content;
  edits[id] = { ...edits[id], ...clean };
  await fs.mkdir(path.dirname(DEMO_EDITS_FILE), { recursive: true });
  await fs.writeFile(DEMO_EDITS_FILE, JSON.stringify(edits, null, 2), 'utf8');
}
