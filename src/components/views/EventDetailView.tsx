'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getEventDetail(id)  ->  StorioEvent | null
 *     loadEvent() in src/lib/events.ts
 */

import Link from 'next/link';
import type { StorioEvent } from '@storio/template-sdk';
import { CmsField, CmsSection, useCollectionItem } from '@/lib/storio-editor/site';

import { useEventDetailText } from '@/components/cms/useEventDetailText';
import { RichText } from '@/components/site/RichText';
import { eventImage } from '@/lib/events';
import { formatDate, formatTime } from '@/lib/format';

const PAGE = 'template-10-starter-event-detail';

/**
 * One event (getEventDetail), an editor page with collection "event".
 * Title, excerpt and location are record fields (live while the admin types); the rest is SDK data.
 */
export function EventDetailView({ event }: { event: StorioEvent }) {
  const { labels } = useEventDetailText();
  // Event records are identified by their slug in the editor (see the Editor Template Guide, Records).
  const id = event.slug || String(event.id);
  const values = useCollectionItem('event', id, {
    title: event.title,
    excerpt: event.excerpt ?? '',
    location: event.location ?? '',
  });
  const image = eventImage(event);
  const when = [formatDate(event.start_date), formatTime(event.start_date), event.end_date ? `– ${formatDate(event.end_date)} ${formatTime(event.end_date)}` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CmsSection sectionKey="labels" title="Labels" page={PAGE}>
        <Link href="/events" className="text-sm font-semibold text-brand">
          <CmsField path="backText" label="Back link">{labels.backText}</CmsField>
        </Link>

        <article className="mt-6 space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField collection="event" item={id} path="title" label="Event title">{values.title}</CmsField>
          </h1>
          {values.excerpt && (
            <p className="text-lg opacity-80">
              <CmsField collection="event" item={id} path="excerpt" label="Excerpt">{values.excerpt}</CmsField>
            </p>
          )}
          <dl className="grid gap-4 rounded-2xl bg-surface p-5 sm:grid-cols-2">
            {when && (
              <div>
                <dt className="text-sm opacity-60">
                  <CmsField path="dateLabel" label="Date label">{labels.dateLabel}</CmsField>
                </dt>
                <dd className="font-semibold">{when}</dd>
              </div>
            )}
            {values.location && (
              <div>
                <dt className="text-sm opacity-60">
                  <CmsField path="locationLabel" label="Location label">{labels.locationLabel}</CmsField>
                </dt>
                <dd className="font-semibold">
                  <CmsField collection="event" item={id} path="location" label="Location">{values.location}</CmsField>
                </dd>
              </div>
            )}
          </dl>
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="aspect-video w-full rounded-2xl object-cover" />
          )}
          <RichText html={event.content} className="space-y-4 text-lg leading-relaxed" />
          {event.categories_detail && event.categories_detail.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {event.categories_detail.map((c, i) => (
                <li key={c.id ?? i} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {c.name}
                </li>
              ))}
            </ul>
          )}
        </article>
      </CmsSection>
    </main>
  );
}
