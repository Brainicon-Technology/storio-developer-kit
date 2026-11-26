'use client';

import Link from 'next/link';
import { CalendarDays, MapPin } from 'lucide-react';
import type { StorioEvent } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useEventsText } from '@/components/cms/useEventsText';
import { eventImage, eventPath } from '@/lib/events';
import { formatDate, formatTime } from '@/lib/format';

const PAGE = 'template-0-starter-events';

/**
 * Event list (getEvents). An event's title, excerpt and location are record fields
 * (collection="event"): the editor may change them, and the save changes the event itself.
 */
export function EventsView({ events }: { events: StorioEvent[] }) {
  const { intro } = useEventsText();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Events" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>

        {events.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <ul className="space-y-6">
            {events.map((event) => {
              const id = String(event.id);
              const image = eventImage(event);
              return (
                <li key={event.id} className="grid overflow-hidden rounded-2xl border border-black/10 md:grid-cols-[240px_1fr]">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="h-full min-h-40 w-full object-cover" />
                  ) : (
                    <div className="hidden bg-surface md:block" />
                  )}
                  <div className="space-y-2 p-6">
                    {event.is_featured && (
                      <span className="inline-block rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                        <CmsField path="featuredLabel" label="Featured label">{intro.featuredLabel}</CmsField>
                      </span>
                    )}
                    <h2 className="text-xl font-semibold">
                      <CmsField collection="event" item={id} path="title" label="Event title">{event.title}</CmsField>
                    </h2>
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-70">
                      {event.start_date && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" aria-hidden />
                          {formatDate(event.start_date)} {formatTime(event.start_date)}
                        </span>
                      )}
                      {event.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" aria-hidden />
                          <CmsField collection="event" item={id} path="location" label="Location">{event.location}</CmsField>
                        </span>
                      )}
                    </p>
                    {event.excerpt && (
                      <p className="opacity-80">
                        <CmsField collection="event" item={id} path="excerpt" label="Excerpt">{event.excerpt}</CmsField>
                      </p>
                    )}
                    <Link href={eventPath(event)} className="inline-block text-sm font-semibold text-brand">
                      <CmsField path="detailsText" label="Details link">{intro.detailsText}</CmsField>
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
