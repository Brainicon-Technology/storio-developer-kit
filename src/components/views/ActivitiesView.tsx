'use client';

import Link from 'next/link';
import type { StorioActivityItem } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useActivitiesText } from '@/components/cms/useActivitiesText';
import { activityImage, activityPath, activitySummary } from '@/lib/activities';

const PAGE = 'template-0-starter-activities';

/** Activity list (getActivities). Activity texts are school data: edited on the dashboard, no pencil. */
export function ActivitiesView({ activities }: { activities: StorioActivityItem[] }) {
  const { intro } = useActivitiesText();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Activities" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>

        {activities.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => {
              const image = activityImage(activity);
              return (
                <li key={activity.id} className="flex flex-col overflow-hidden rounded-2xl border border-black/10">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="aspect-video w-full object-cover" />
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h2 className="text-lg font-semibold">{activity.title}</h2>
                    <p className="flex-1 text-sm opacity-80">{activitySummary(activity)}</p>
                    <Link href={activityPath(activity)} className="mt-2 text-sm font-semibold text-brand">
                      <CmsField path="readMoreText" label="Read more">{intro.readMoreText}</CmsField>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CmsSection>
    </main>
  );
}
