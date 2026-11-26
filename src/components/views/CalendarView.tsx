'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getCalendarEvents()    ->  StorioCalendarEvent[]
 *     loadCalendarEvents() in src/lib/calendar.ts
 *   storio.getCalendarSettings()  ->  StorioCalendarSetting ({ weekend_days: "5,6" }, shown as day names)
 *     loadWeekendDays() in src/lib/calendar.ts
 */

import type { StorioCalendarEvent } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useCalendarText } from '@/components/cms/useCalendarText';
import { formatDate } from '@/lib/format';

const PAGE = 'template-10-starter-calendar';

/** Academic calendar (getCalendarEvents), grouped by month on the server. */
export function CalendarView({ months, weekendDays }: { months: { title: string; events: StorioCalendarEvent[] }[]; weekendDays: string[] }) {
  const { intro } = useCalendarText();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Calendar" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
          {weekendDays.length > 0 && (
            <p className="text-sm">
              <span className="font-semibold">
                <CmsField path="weekendLabel" label="Weekly holidays label">{intro.weekendLabel}</CmsField>
              </span>{' '}
              {weekendDays.join(', ')}
            </p>
          )}
        </header>

        {months.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          months.map((month) => (
            <section key={month.title} className="mb-10">
              <h2 className="mb-4 text-xl font-bold text-brand">{month.title}</h2>
              <ul className="space-y-3">
                {month.events.map((event) => (
                  <li key={event.id} className="flex gap-4 rounded-xl border border-black/10 p-4">
                    <div className="w-32 shrink-0 text-sm font-semibold">
                      {formatDate(event.start_date)}
                      {event.end_date && event.end_date !== event.start_date && <span className="block opacity-60">– {formatDate(event.end_date)}</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{event.title}</p>
                      {event.description && <p className="text-sm opacity-80">{event.description}</p>}
                      <p className="mt-1 flex flex-wrap gap-2 text-xs">
                        {event.category && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">{event.category}</span>}
                        {event.is_all_day && (
                          <span className="rounded-full bg-surface px-2 py-0.5">
                            <CmsField path="allDayLabel" label="All day label">{intro.allDayLabel}</CmsField>
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </CmsSection>
    </main>
  );
}
