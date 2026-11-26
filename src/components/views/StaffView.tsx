'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getStaff()  ->  StorioStaffMember[]
 *     loadStaff() in src/lib/people.ts
 */

import { Mail, Phone } from 'lucide-react';
import type { StorioStaffMember } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useStaffText } from '@/components/cms/useStaffText';

const PAGE = 'template-10-starter-staff';

/** Staff directory (getStaff), grouped by department on the server. */
export function StaffView({ departments }: { departments: [string, StorioStaffMember[]][] }) {
  const { intro } = useStaffText();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Staff" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>

        {departments.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          departments.map(([department, members]) => (
            <section key={department} className="mb-12 last:mb-0">
              <h2 className="mb-5 text-2xl font-bold">
                {department ? department : <CmsField path="otherDepartment" label="No department">{intro.otherDepartment}</CmsField>}
              </h2>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {members.map((m) => (
                  <li key={m.id} className="rounded-2xl border border-black/10 p-5 text-center">
                    {m.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo_url} alt={m.name} className="mx-auto mb-3 h-24 w-24 rounded-full object-cover" />
                    )}
                    <p className="font-semibold">{m.name}</p>
                    {m.designation && <p className="text-sm opacity-70">{m.designation}</p>}
                    <div className="mt-3 flex justify-center gap-3 text-brand">
                      {m.email && (
                        <a href={`mailto:${m.email}`} aria-label={m.email}>
                          <Mail className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                      {m.phone_number && (
                        <a href={`tel:${m.phone_number}`} aria-label={m.phone_number}>
                          <Phone className="h-4 w-4" aria-hidden />
                        </a>
                      )}
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
