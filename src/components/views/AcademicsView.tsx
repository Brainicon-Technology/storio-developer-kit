'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getAcademicPrograms()     ->  StorioAcademicProgram[]
 *     loadAcademicPrograms() in src/lib/academics.ts
 *   storio.getClassRoutines()        ->  StorioClassRoutine[]
 *     loadClassRoutines() in src/lib/academics.ts
 *   storio.getSyllabuses()           ->  StorioSyllabus[]
 *     loadSyllabuses() in src/lib/academics.ts
 *   storio.getStudentStats(params?)  ->  StorioStudentStatsResponse | null
 *     loadStudentStats() in src/lib/academics.ts
 */

import { useState } from 'react';
import { Download } from 'lucide-react';
import type { StorioAcademicProgram, StorioClassRoutine, StorioStudentStatsResponse, StorioSyllabus } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { EmptyInEditor, useInEditor } from '@/components/cms/EditorOnly';
import { useAcademicsText } from '@/components/cms/useAcademicsText';
import { routineDays } from '@/lib/academics';

const PAGE = 'template-10-starter-academics';

export interface AcademicsData {
  programs: StorioAcademicProgram[];
  routines: StorioClassRoutine[];
  syllabuses: StorioSyllabus[];
  stats: StorioStudentStatsResponse | null;
}

/**
 * Academics: four SDK methods on one page
 * (getAcademicPrograms, getClassRoutines, getSyllabuses, getStudentStats).
 * Class routines: pick a class; the schedule shows as a table, or as a file link when the
 * school uploaded a file instead of a schedule.
 */
export function AcademicsView({ programs, routines, syllabuses, stats }: AcademicsData) {
  const text = useAcademicsText();
  const inEditor = useInEditor();
  const [routineIndex, setRoutineIndex] = useState(0);
  const routine = routines[routineIndex];
  const days = routine ? routineDays(routine) : [];
  const periods = Math.max(0, ...days.map((d) => (d.periods ?? d.slots ?? []).length));

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
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

      {(programs.length > 0 || inEditor) && (
        <CmsSection sectionKey="programs" title="Programmes" page={PAGE}>
          <section className="mb-16">
            <h2 className="mb-6 text-3xl font-bold">
              <CmsField path="title" label="Title">{text.programs.title}</CmsField>
            </h2>
            {programs.length === 0 && <EmptyInEditor source="Academic Programs" />}
            <div className="grid gap-6 md:grid-cols-3">
              {programs.map((program, i) => (
                <div key={program.id ?? `${program.name}-${i}`} className="rounded-2xl border border-black/10 p-6">
                  <h3 className="mb-3 text-lg font-semibold text-brand">{program.name}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {program.classes.map((c) => (
                      <li key={c} className="rounded-full bg-surface px-3 py-1 text-sm">{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </CmsSection>
      )}

      <CmsSection sectionKey="routines" title="Class routines" page={PAGE}>
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">
            <CmsField path="title" label="Title">{text.routines.title}</CmsField>
          </h2>
          {routines.length === 0 ? (
            <p className="rounded-xl border border-black/10 p-4 opacity-70">
              <CmsField path="emptyText" label="Empty text">{text.routines.emptyText}</CmsField>
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {routines.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoutineIndex(i)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${i === routineIndex ? 'bg-brand text-white' : 'bg-surface'}`}
                  >
                    {r.class_name}
                    {r.section && (
                      <>
                        {' · '}
                        <CmsField path="sectionLabel" label="Section label">{text.routines.sectionLabel}</CmsField> {r.section}
                      </>
                    )}
                    {r.shift ? ` · ${r.shift}` : ''}
                  </button>
                ))}
              </div>
              {days.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-black/10">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-surface">
                      <tr>
                        <th className="p-3" />
                        {Array.from({ length: periods }, (_, i) => (
                          <th key={i} className="p-3 font-semibold">
                            <CmsField path="periodLabel" label="Period label">{text.routines.periodLabel}</CmsField> {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day) => (
                        <tr key={day.day} className="border-t border-black/10">
                          <th className="p-3 font-semibold">{day.day}</th>
                          {Array.from({ length: periods }, (_, i) => {
                            const slot = (day.periods ?? day.slots ?? [])[i];
                            return (
                              <td key={i} className="p-3 align-top">
                                {slot && (
                                  <>
                                    <span className="block font-semibold">{slot.subject}</span>
                                    {slot.teacher && <span className="block opacity-70">{slot.teacher}</span>}
                                    {slot.start_time && (
                                      <span className="block text-xs opacity-60">
                                        {slot.start_time}
                                        {slot.end_time ? `–${slot.end_time}` : ''}
                                      </span>
                                    )}
                                  </>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {routine?.routine_file_url && (
                <a href={routine.routine_file_url} className="mt-4 inline-flex items-center gap-2 font-semibold text-brand">
                  <Download className="h-4 w-4" aria-hidden />
                  <CmsField path="downloadText" label="Download link">{text.routines.downloadText}</CmsField>
                </a>
              )}
            </>
          )}
        </section>
      </CmsSection>

      <CmsSection sectionKey="syllabuses" title="Syllabuses" page={PAGE}>
        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">
            <CmsField path="title" label="Title">{text.syllabuses.title}</CmsField>
          </h2>
          {syllabuses.length === 0 ? (
            <p className="rounded-xl border border-black/10 p-4 opacity-70">
              <CmsField path="emptyText" label="Empty text">{text.syllabuses.emptyText}</CmsField>
            </p>
          ) : (
            <ul className="divide-y divide-black/10 rounded-2xl border border-black/10">
              {syllabuses.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm opacity-70">{[s.class_name, s.exam_type, s.academic_year, s.file_size].filter(Boolean).join(' · ')}</p>
                  </div>
                  {s.file_url && (
                    <a href={s.file_url} className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                      <Download className="h-4 w-4" aria-hidden />
                      <CmsField path="downloadText" label="Download link">{text.syllabuses.downloadText}</CmsField>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </CmsSection>

      {(stats || inEditor) && (
        <CmsSection sectionKey="stats" title="Student numbers" page={PAGE}>
          <section>
            <h2 className="mb-6 text-3xl font-bold">
              <CmsField path="title" label="Title">{text.stats.title}</CmsField> <span className="opacity-50">{stats?.academic_year}</span>
            </h2>
            {!stats ? (
              <EmptyInEditor source="Student Stats" />
            ) : (
              <>
            <dl className="mb-6 grid gap-4 sm:grid-cols-4">
              {(
                [
                  ['totalLabel', stats.grand_total],
                  ['maleLabel', stats.grand_total_male],
                  ['femaleLabel', stats.grand_total_female],
                  ['sectionsLabel', stats.total_sections],
                ] as const
              ).map(([path, value]) => (
                <div key={path} className="rounded-2xl bg-surface p-5">
                  <dd className="text-3xl font-extrabold text-brand">{value}</dd>
                  <dt className="text-sm opacity-70">
                    <CmsField path={path} label={path}>{text.stats[path]}</CmsField>
                  </dt>
                </div>
              ))}
            </dl>
            <div className="overflow-x-auto rounded-2xl border border-black/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface">
                  <tr>
                    <th className="p-3"><CmsField path="classLabel" label="Class label">{text.stats.classLabel}</CmsField></th>
                    <th className="p-3">{text.stats.maleLabel}</th>
                    <th className="p-3">{text.stats.femaleLabel}</th>
                    <th className="p-3">{text.stats.totalLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.classes.map((c) => (
                    <tr key={c.id} className="border-t border-black/10">
                      <td className="p-3 font-semibold">{c.class_name_en || c.class_name}</td>
                      <td className="p-3">{c.total_male ?? '–'}</td>
                      <td className="p-3">{c.total_female ?? '–'}</td>
                      <td className="p-3">{c.total_students ?? '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              </>
            )}
          </section>
        </CmsSection>
      )}
    </main>
  );
}
