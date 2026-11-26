import { storio, type StorioEvent } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/**
 * Campus events: Storio records (collection "event"). The editor may change an event's
 * title, excerpt and location (<CmsField collection="event" item={id} path="...">).
 */
export async function loadEvents(ctx: TenantContext): Promise<StorioEvent[]> {
  const real = await safely(storio.getEvents(ctx.tenantHost));
  const events = withDemoFallback(real, DEFAULT_DEMO_DATA.events, ctx.isStandalone);
  return [...events].sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''));
}

/** One event, by slug or id (the URL uses the slug when there is one). */
export async function loadEvent(slugOrId: string, ctx: TenantContext): Promise<StorioEvent | null> {
  const real = await safely(storio.getEventDetail(slugOrId, ctx.tenantHost));
  const demo = DEFAULT_DEMO_DATA.events.find((e) => e.slug === slugOrId || String(e.id) === slugOrId);
  return withDemoRecord(real, demo, ctx.isStandalone);
}

/** The public URL of an event: its slug, or its id. */
export const eventPath = (event: StorioEvent) => `/events/${encodeURIComponent(event.slug || String(event.id))}`;

/** The event's image (the field name differs between list and detail responses). */
export const eventImage = (event: StorioEvent) => event.featured_image_detail?.url || event.featured_image || '';
