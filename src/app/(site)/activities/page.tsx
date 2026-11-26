import type { Metadata } from 'next';

import { categoryKey } from '@/components/site/CategoryTabs';
import { ActivitiesView } from '@/components/views/ActivitiesView';
import { loadActivityCategories, loadActivities } from '@/lib/activities';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-activities');
}

/** /activities?category=<slug>: the category's id goes to the SDK filter. */
export default async function ActivitiesPage({ searchParams }: PageProps<'/activities'>) {
  const ctx = await resolveTenant();
  const { category: slug } = await searchParams;
  const categories = await loadActivityCategories(ctx);
  const category = categories.find((c) => categoryKey(c) === slug);
  const activities = await loadActivities(ctx, category);
  return <ActivitiesView activities={activities} categories={categories} activeCategory={category && categoryKey(category)} />;
}
