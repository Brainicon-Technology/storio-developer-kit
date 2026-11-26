import type { Metadata } from 'next';

import { EventsView } from '@/components/views/EventsView';
import { loadEvents } from '@/lib/events';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-events');
}

export default async function EventsPage() {
  const events = await loadEvents(await resolveTenant());
  return <EventsView events={events} />;
}
