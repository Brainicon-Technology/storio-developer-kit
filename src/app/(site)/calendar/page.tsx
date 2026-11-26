import type { Metadata } from 'next';

import { CalendarView } from '@/components/views/CalendarView';
import { byMonth, loadCalendarEvents, monthTitle } from '@/lib/calendar';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-calendar');
}

export default async function CalendarPage() {
  const events = await loadCalendarEvents(await resolveTenant());
  const months = byMonth(events).map(([key, list]) => ({ title: monthTitle(key), events: list }));
  return <CalendarView months={months} />;
}
