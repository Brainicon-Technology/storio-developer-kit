import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { EventDetailView } from '@/components/views/EventDetailView';
import { htmlToText } from '@/components/site/RichText';
import { loadEvent } from '@/lib/events';
import { resolveTenant } from '@/lib/tenant';

/** One event (collection "event"), by id. Metadata comes from the event itself. */
export async function generateMetadata({ params }: PageProps<'/events/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const event = await loadEvent(id, await resolveTenant());
  if (!event) return {};
  return { title: event.title, description: (event.excerpt || htmlToText(event.content)).slice(0, 160) };
}

export default async function EventDetailPage({ params }: PageProps<'/events/[id]'>) {
  const { id } = await params;
  const event = await loadEvent(id, await resolveTenant());
  if (!event) notFound(); // a real 404 (src/app/(site)/not-found.tsx)
  return <EventDetailView event={event} />;
}
