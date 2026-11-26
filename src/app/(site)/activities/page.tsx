import type { Metadata } from 'next';

import { ActivitiesView } from '@/components/views/ActivitiesView';
import { loadActivities } from '@/lib/activities';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-activities');
}

export default async function ActivitiesPage() {
  const activities = await loadActivities(await resolveTenant());
  return <ActivitiesView activities={activities} />;
}
