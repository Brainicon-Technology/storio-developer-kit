import { storio, type StorioCalendarEvent } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback } from './data';
import type { TenantContext } from './tenant';

/** Academic calendar: holidays, exams, term dates (dashboard: Calendar). */
export async function loadCalendarEvents(ctx: TenantContext): Promise<StorioCalendarEvent[]> {
  const real = await safely(storio.getCalendarEvents(ctx.tenantHost));
  const events = withDemoFallback(real, DEFAULT_DEMO_DATA.calendarEvents, ctx.isStandalone);
  return [...events].sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''));
}

/** Groups calendar entries by month ("2027-03"), in date order. */
export function byMonth(events: StorioCalendarEvent[]): [string, StorioCalendarEvent[]][] {
  const months = new Map<string, StorioCalendarEvent[]>();
  for (const event of events) {
    const key = (event.start_date ?? '').slice(0, 7) || 'unknown';
    months.set(key, [...(months.get(key) ?? []), event]);
  }
  return [...months.entries()];
}

/** "2027-03" -> "March 2027". */
export function monthTitle(key: string): string {
  const date = new Date(`${key}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
