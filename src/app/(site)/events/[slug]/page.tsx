import type { Metadata } from 'next';

import { EventDetailView } from '@/components/views/EventDetailView';
import { htmlToText } from '@/components/site/RichText';
import { loadEvent } from '@/lib/events';
import { resolveTenant } from '@/lib/tenant';

/** One event (collection "event"), by slug or id. Metadata comes from the event itself. */
export async function generateMetadata({ params }: PageProps<'/events/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug, await resolveTenant());
  if (!event) return {};
  return { title: event.title, description: (event.excerpt || htmlToText(event.content)).slice(0, 160) };
}

export default async function EventDetailPage({ params }: PageProps<'/events/[slug]'>) {
  const { slug } = await params;
  const event = await loadEvent(slug, await resolveTenant());
  return <EventDetailView event={event} />;
}
