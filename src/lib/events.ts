import { cache } from 'react';
import { storio, type StorioEvent, type StorioEventCategory } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { listOf, normalizeEvent, normalizeEvents } from './normalize';
import type { TenantContext } from './tenant';

/**
 * Campus events: Storio records (collection "event"). The editor may change an event's
 * title, excerpt and location (<CmsField collection="event" item={id} path="...">).
 *
 * Two things the live API does differently from the SDK types:
 * - getEvents returns a paginated object ({ count, results }), handled by normalizeEvents;
 * - getEventDetail finds an event by its id only, so event URLs use the id (/events/24).
 */
export const loadEvents = cache(async function loadEvents(ctx: TenantContext, category?: StorioEventCategory): Promise<StorioEvent[]> {
  const real = normalizeEvents(await safely(storio.getEvents(category ? { categories: category.id, tenantHost: ctx.tenantHost } : ctx.tenantHost)));
  const demo = category ? DEFAULT_DEMO_DATA.events.filter((e) => e.categories_detail?.some((c) => c.id === category.id)) : DEFAULT_DEMO_DATA.events;
  const events = withDemoFallback(real, demo, ctx.isStandalone);
  return [...events].sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''));
});

/** Event categories (getEventCategories, paginated in the API like getEvents) for the filter tabs. */
export const loadEventCategories = cache(async function loadEventCategories(ctx: TenantContext): Promise<StorioEventCategory[]> {
  const real = listOf(await safely(storio.getEventCategories(ctx.tenantHost))) as StorioEventCategory[] | null;
  return withDemoFallback(real, DEFAULT_DEMO_DATA.eventCategories, ctx.isStandalone);
});

/** One event by id. An old slug URL still works: the slug is looked up in the list first. */
export const loadEvent = cache(async function loadEvent(idOrSlug: string, ctx: TenantContext): Promise<StorioEvent | null> {
  let id = idOrSlug;
  if (!/^\d+$/.test(idOrSlug)) {
    const match = (await loadEvents(ctx)).find((e) => e.slug === idOrSlug);
    if (match) id = String(match.id);
  }
  const real = /^\d+$/.test(id) ? normalizeEvent(await safely(storio.getEventDetail(id, ctx.tenantHost))) : null;
  const demo = DEFAULT_DEMO_DATA.events.find((e) => String(e.id) === id || e.slug === idOrSlug);
  return withDemoRecord(real, demo, ctx.isStandalone);
});

/** The public URL of an event (by id: see above). */
export const eventPath = (event: StorioEvent) => `/events/${event.id}`;

/** The event's image URL (normalized into featured_image; the detail object is the fallback). */
export const eventImage = (event: StorioEvent) => event.featured_image || event.featured_image_detail?.url || '';
