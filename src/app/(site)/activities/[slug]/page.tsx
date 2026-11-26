import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ActivityDetailView } from '@/components/views/ActivityDetailView';
import { htmlToText } from '@/components/site/RichText';
import { activitySummary, loadActivity } from '@/lib/activities';
import { resolveTenant } from '@/lib/tenant';

/**
 * One activity. Not an editor page (the editor allows [slug] pages only for notice, blog and
 * event); its labels come from the Activities page's "detail" section.
 */
export async function generateMetadata({ params }: PageProps<'/activities/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const activity = await loadActivity(slug, await resolveTenant());
  if (!activity) return {};
  return { title: activity.title, description: (activitySummary(activity) || htmlToText(activity.content)).slice(0, 160) };
}

export default async function ActivityDetailPage({ params }: PageProps<'/activities/[slug]'>) {
  const { slug } = await params;
  const activity = await loadActivity(slug, await resolveTenant());
  if (!activity) notFound(); // a real 404 (src/app/(site)/not-found.tsx)
  return <ActivityDetailView activity={activity} />;
}
