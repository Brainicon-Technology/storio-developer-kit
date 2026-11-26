import { storio, type StorioCalendarEvent } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/** Academic calendar: holidays, exams, term dates (dashboard: Calendar). */
export async function loadCalendarEvents(ctx: TenantContext): Promise<StorioCalendarEvent[]> {
  const real = await safely(storio.getCalendarEvents(ctx.tenantHost));
  const events = withDemoFallback(real, DEFAULT_DEMO_DATA.calendarEvents, ctx.isStandalone);
  return [...events].sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''));
}

/**
 * The school's weekly holidays (dashboard: Calendar > Settings).
 * storio.getCalendarSettings() -> StorioCalendarSetting: { weekend_days: "5,6" }, JavaScript day
 * numbers (0 = Sunday ... 6 = Saturday). Returned as day names in English ("Friday", "Saturday").
 */
export async function loadWeekendDays(ctx: TenantContext): Promise<string[]> {
  const real = await safely(storio.getCalendarSettings(ctx.tenantHost));
  const settings = withDemoRecord(real, DEFAULT_DEMO_DATA.calendarSettings, ctx.isStandalone);
  const dayName = (n: number) => new Intl.DateTimeFormat('en', { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + n)));
  return (settings?.weekend_days ?? '')
    .split(',')
    .map((d) => Number(d.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    .map(dayName);
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
