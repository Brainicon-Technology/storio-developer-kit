import type { Metadata } from 'next';

import { categoryKey } from '@/components/site/CategoryTabs';
import { EventsView } from '@/components/views/EventsView';
import { loadEventCategories, loadEvents } from '@/lib/events';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-events');
}

/** /events?category=<slug>: the category's id goes to the SDK filter. */
export default async function EventsPage({ searchParams }: PageProps<'/events'>) {
  const ctx = await resolveTenant();
  const { category: slug } = await searchParams;
  const categories = await loadEventCategories(ctx);
  const category = categories.find((c) => categoryKey(c) === slug);
  const events = await loadEvents(ctx, category);
  return <EventsView events={events} categories={categories} activeCategory={category && categoryKey(category)} />;
}
