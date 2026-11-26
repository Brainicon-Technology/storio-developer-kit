import type { Metadata } from 'next';

import { CalendarView } from '@/components/views/CalendarView';
import { byMonth, loadCalendarEvents, loadWeekendDays, monthTitle } from '@/lib/calendar';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-calendar');
}

export default async function CalendarPage() {
  const ctx = await resolveTenant();
  const [events, weekendDays] = await Promise.all([loadCalendarEvents(ctx), loadWeekendDays(ctx)]);
  const months = byMonth(events).map(([key, list]) => ({ title: monthTitle(key), events: list }));
  return <CalendarView months={months} weekendDays={weekendDays} />;
}
