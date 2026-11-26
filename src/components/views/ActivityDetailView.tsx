'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getActivityDetail(slug)  ->  StorioActivityItem | null
 *     loadActivity() in src/lib/activities.ts
 */

import Link from 'next/link';
import type { StorioActivityItem } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useActivitiesText } from '@/components/cms/useActivitiesText';
import { RichText } from '@/components/site/RichText';
import { activityDate, activityImage, activitySummary } from '@/lib/activities';
import { formatDate } from '@/lib/format';

/**
 * One activity (getActivityDetail).
 *
 * The Storio editor allows a [slug] editor page only for notice, blog and event records, so this
 * route is not in "editorPages". Its few labels live in the "detail" section of the Activities list
 * page instead (page="...-activities", sectionKey="detail"), and admins edit them there.
 * Use the same pattern for any other detail page (careers, custom pages...).
 */
const LIST_PAGE = 'template-10-starter-activities';

export function ActivityDetailView({ activity }: { activity: StorioActivityItem }) {
  const { detail } = useActivitiesText();
  const image = activityImage(activity);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CmsSection sectionKey="detail" title="Activity page labels" page={LIST_PAGE}>
        <Link href="/activities" className="text-sm font-semibold text-brand">
          <CmsField path="backText" label="Back link">{detail.backText}</CmsField>
        </Link>

        <article className="mt-6 space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">{activity.title}</h1>
          {activityDate(activity) && <p className="text-sm opacity-60">{formatDate(activityDate(activity))}</p>}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="aspect-video w-full rounded-2xl object-cover" />
          )}
          <RichText html={activity.content || activitySummary(activity)} className="space-y-4 text-lg leading-relaxed" />
        </article>
      </CmsSection>
    </main>
  );
}
