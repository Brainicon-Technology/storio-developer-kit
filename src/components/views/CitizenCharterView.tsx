'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getHotlines()            ->  StorioHotline[]
 *     loadHotlines() in src/lib/charter.ts
 *   storio.getMpoInfo()             ->  StorioMpoInfo | null
 *     loadMpoInfo() in src/lib/charter.ts
 *   storio.getInformationService()  ->  StorioInformationService | null
 *     loadInformationService() in src/lib/charter.ts
 *   storio.getComplaintOfficer()    ->  StorioComplaintOfficer | null
 *     loadComplaintOfficer() in src/lib/charter.ts
 */

import { FileText, Mail, Phone } from 'lucide-react';
import type { StorioComplaintStep, StorioHotline, StorioInformationService, StorioComplaintOfficer, StorioMpoInfo } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { EmptyInEditor, useInEditor } from '@/components/cms/EditorOnly';
import { useCitizenCharterText } from '@/components/cms/useCitizenCharterText';
import { formatDate } from '@/lib/format';

const PAGE = 'template-0-starter-citizen-charter';

export interface CitizenCharterData {
  mpo: StorioMpoInfo | null;
  info: StorioInformationService | null;
  services: string[];
  officer: StorioComplaintOfficer | null;
  steps: StorioComplaintStep[];
  hotlines: StorioHotline[];
}

/**
 * Citizen charter: four SDK methods on one page
 * (getHotlines, getMpoInfo, getInformationService, getComplaintOfficer).
 * Each block is hidden when the school has no data for it.
 */
export function CitizenCharterView({ mpo, info, services, officer, steps, hotlines }: CitizenCharterData) {
  const text = useCitizenCharterText();
  const inEditor = useInEditor();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Intro" page={PAGE}>
        <header className="mb-12 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{text.intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{text.intro.text}</CmsField>
          </p>
        </header>
      </CmsSection>

      {(hotlines.length > 0 || inEditor) && (
        <CmsSection sectionKey="hotlines" title="Hotlines" page={PAGE}>
          {hotlines.length === 0 && <EmptyInEditor source="Hotlines" />}
          <section className="mb-14">
            <h2 className="mb-5 text-2xl font-bold">
              <CmsField path="title" label="Title">{text.hotlines.title}</CmsField>
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hotlines.map((h) => (
                <li key={h.id} className={`rounded-2xl p-5 ${h.is_emergency ? 'bg-red-600 text-white' : 'bg-surface'}`}>
                  {h.is_emergency && (
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                      <CmsField path="emergencyLabel" label="Emergency label">{text.hotlines.emergencyLabel}</CmsField>
                    </span>
                  )}
                  <p className="font-semibold">{h.title}</p>
                  <a href={`tel:${h.number.replace(/[^\d+]/g, '')}`} className="text-2xl font-extrabold">
                    {h.number}
                  </a>
                  {h.description && <p className="mt-1 text-sm opacity-80">{h.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        </CmsSection>
      )}

      {(mpo || inEditor) && (
        <CmsSection sectionKey="mpo" title="MPO information" page={PAGE}>
          {!mpo && <EmptyInEditor source="MPO Info" />}
          <section className="mb-14 rounded-2xl border border-black/10 p-6">
            <h2 className="mb-1 text-2xl font-bold">
              <CmsField path="title" label="Title">{text.mpo?.title}</CmsField>
            </h2>
            <p className={`mb-4 font-semibold ${mpo?.is_mpo_enlisted ? 'text-brand' : 'opacity-70'}`}>
              {mpo?.is_mpo_enlisted ? (
                <CmsField path="enlistedText" label="Enlisted text">{text.mpo?.enlistedText}</CmsField>
              ) : (
                <CmsField path="notEnlistedText" label="Not enlisted text">{text.mpo?.notEnlistedText}</CmsField>
              )}
            </p>
            {mpo?.description && <p className="mb-4 opacity-80">{mpo?.description}</p>}
            <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {(
                [
                  ['codeLabel', mpo?.mpo_code],
                  ['dateLabel', formatDate(mpo?.mpo_date)],
                  ['orderLabel', mpo?.mpo_order_number],
                  ['mpoTeachersLabel', mpo?.total_mpo_teachers],
                  ['nonMpoTeachersLabel', mpo?.total_non_mpo_teachers],
                ] as const
              )
                .filter(([, value]) => value !== undefined && value !== '')
                .map(([path, value]) => (
                  <div key={path}>
                    <dt className="text-sm opacity-60">
                      <CmsField path={path} label={path}>{text.mpo[path]}</CmsField>
                    </dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
            </dl>
            {mpo?.documents && mpo?.documents.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 font-semibold">
                  <CmsField path="documentsTitle" label="Documents title">{text.mpo?.documentsTitle}</CmsField>
                </h3>
                <ul className="space-y-1">
                  {mpo?.documents.map((doc, i) => (
                    <li key={`${doc.title}-${i}`}>
                      <a href={doc.file_url} className="inline-flex items-center gap-2 text-brand">
                        <FileText className="h-4 w-4" aria-hidden />
                        {doc.title} {doc.issue_date && <span className="opacity-60">({formatDate(doc.issue_date)})</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </CmsSection>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {(info || inEditor) && (
          <CmsSection sectionKey="info" title="Information desk" page={PAGE}>
            {!info && <EmptyInEditor source="Information Service" />}
            <section className="h-full rounded-2xl border border-black/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">
                <CmsField path="title" label="Title">{text.info?.title}</CmsField>
              </h2>
              <Person name={info?.responsible_person} role={info?.designation} photo={info?.photo_url} phone={info?.mobile || info?.phone} email={info?.email} />
              {info?.description && <p className="mt-4 opacity-80">{info?.description}</p>}
              {info?.office_hours && (
                <p className="mt-3 text-sm">
                  <span className="opacity-60">
                    <CmsField path="officeHoursLabel" label="Office hours label">{text.info?.officeHoursLabel}</CmsField>:
                  </span>{' '}
                  {info?.office_hours}
                </p>
              )}
              {services.length > 0 && (
                <>
                  <h3 className="mb-2 mt-4 font-semibold">
                    <CmsField path="servicesTitle" label="Services title">{text.info?.servicesTitle}</CmsField>
                  </h3>
                  <ul className="list-disc space-y-1 pl-5 opacity-90">
                    {services.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </CmsSection>
        )}

        {(officer || inEditor) && (
          <CmsSection sectionKey="complaint" title="Complaints" page={PAGE}>
            {!officer && <EmptyInEditor source="Complaint Officer" />}
            <section className="h-full rounded-2xl border border-black/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">
                <CmsField path="title" label="Title">{text.complaint.title}</CmsField>
              </h2>
              <Person name={officer?.name} role={officer?.designation} photo={officer?.photo_url} phone={officer?.mobile || officer?.phone} email={officer?.email} />
              {officer?.description && <p className="mt-4 opacity-80">{officer?.description}</p>}
              {officer?.office_hours && (
                <p className="mt-3 text-sm">
                  <span className="opacity-60">
                    <CmsField path="officeHoursLabel" label="Office hours label">{text.complaint.officeHoursLabel}</CmsField>:
                  </span>{' '}
                  {officer?.office_hours}
                </p>
              )}
              {steps.length > 0 && (
                <>
                  <h3 className="mb-3 mt-4 font-semibold">
                    <CmsField path="processTitle" label="Process title">{text.complaint.processTitle}</CmsField>
                  </h3>
                  <ol className="space-y-3">
                    {steps.map((step, i) => (
                      <li key={step.step_number ?? i} className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                          {step.step_number ?? i + 1}
                        </span>
                        <span>
                          {step.title && <span className="block font-semibold">{step.title}</span>}
                          {step.description && <span className="block text-sm opacity-80">{step.description}</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </section>
          </CmsSection>
        )}
      </div>
    </main>
  );
}

function Person({ name, role, photo, phone, email }: { name?: string; role?: string; photo?: string; phone?: string; email?: string }) {
  return (
    <div className="flex items-center gap-4">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name ?? ''} className="h-16 w-16 rounded-full object-cover" />
      )}
      <div className="space-y-0.5 text-sm">
        {name && <p className="text-base font-semibold">{name}</p>}
        {role && <p className="opacity-70">{role}</p>}
        {phone && (
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1 text-brand">
            <Phone className="h-3.5 w-3.5" aria-hidden /> {phone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-1 text-brand">
            <Mail className="h-3.5 w-3.5" aria-hidden /> {email}
          </a>
        )}
      </div>
    </div>
  );
}
