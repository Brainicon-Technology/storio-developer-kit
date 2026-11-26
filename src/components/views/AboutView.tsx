'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getInstitutionProfile()  ->  StorioInstitutionProfile | null
 *     loadInstitutionProfile() in src/lib/institution.ts
 *   storio.getLeadershipMessages()  ->  LeadershipMessage[] (loose records, narrowed)
 *     loadLeadershipMessages() in src/lib/people.ts
 *   storio.getTeam()                ->  StorioTeamMember[]
 *     loadTeam() in src/lib/people.ts
 */

import type { StorioInstitutionProfile, StorioTeamMember } from '@storio/template-sdk';
import { CmsField, CmsIcon, CmsSection } from '@/lib/storio-editor/site';

import { EmptyInEditor, useInEditor } from '@/components/cms/EditorOnly';
import { useAboutText } from '@/components/cms/useAboutText';
import { RichText } from '@/components/site/RichText';
import type { LeadershipMessage } from '@/lib/types';

const PAGE = 'template-0-starter-about';

export interface AboutData {
  profile: StorioInstitutionProfile | null;
  leadership: LeadershipMessage[];
  /** Team members grouped by their section (governing body, committee...). */
  teamGroups: [string, StorioTeamMember[]][];
}

/**
 * About page: editable texts (intro, values, labels) mixed with school data:
 * - getInstitutionProfile: mission, vision, numbers, EIIN... (the labels around them are editable),
 * - getLeadershipMessages: HTML messages, rendered with <RichText>,
 * - getTeam: the governing body.
 */
export function AboutView({ profile, leadership, teamGroups }: AboutData) {
  const { intro, profile: labels, values, leadership: leadershipText, team } = useAboutText();
  const inEditor = useInEditor();

  const facts: { path: keyof typeof labels; value: string | number | undefined }[] = [
    { path: 'eiinLabel', value: profile?.eiin },
    { path: 'boardLabel', value: profile?.education_board },
    { path: 'typeLabel', value: profile?.school_type },
    { path: 'shiftLabel', value: profile?.school_shift },
  ];

  return (
    <main>
      <CmsSection sectionKey="intro" title="Intro" page={PAGE}>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <CmsField path="title" label="Title">{intro.title}</CmsField>
            </h1>
            <p className="text-lg opacity-80">
              <CmsField path="text" label="Text">{intro.text}</CmsField>
            </p>
          </div>
          {intro.image && (
            <CmsField path="image" label="Image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={intro.image} alt="" className="aspect-video w-full rounded-2xl object-cover" />
            </CmsField>
          )}
        </section>
      </CmsSection>

      {(profile || inEditor) && (
        <CmsSection sectionKey="profile" title="At a glance" page={PAGE}>
          <section className="mx-auto max-w-6xl px-6 pb-16">
            <h2 className="mb-6 text-3xl font-bold">
              <CmsField path="title" label="Title">{labels.title}</CmsField>
            </h2>
            {!profile && <EmptyInEditor source="Institution Profile" />}
            <div className="grid gap-6 md:grid-cols-2">
              {profile?.mission && (
                <div className="rounded-2xl border border-black/10 p-6">
                  <h3 className="mb-2 font-semibold text-brand">
                    <CmsField path="missionLabel" label="Mission label">{labels.missionLabel}</CmsField>
                  </h3>
                  <p className="opacity-80">{profile?.mission}</p>
                </div>
              )}
              {profile?.vision && (
                <div className="rounded-2xl border border-black/10 p-6">
                  <h3 className="mb-2 font-semibold text-brand">
                    <CmsField path="visionLabel" label="Vision label">{labels.visionLabel}</CmsField>
                  </h3>
                  <p className="opacity-80">{profile?.vision}</p>
                </div>
              )}
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {profile?.total_students !== undefined && (
                <div className="rounded-2xl bg-brand p-5 text-white">
                  <dd className="text-3xl font-extrabold">{profile?.total_students}</dd>
                  <dt className="text-sm opacity-90">
                    <CmsField path="studentsLabel" label="Students label">{labels.studentsLabel}</CmsField>
                  </dt>
                </div>
              )}
              {profile?.total_teachers !== undefined && (
                <div className="rounded-2xl bg-accent p-5 text-white">
                  <dd className="text-3xl font-extrabold">{profile?.total_teachers}</dd>
                  <dt className="text-sm opacity-90">
                    <CmsField path="teachersLabel" label="Teachers label">{labels.teachersLabel}</CmsField>
                  </dt>
                </div>
              )}
              {facts
                .filter((fact) => fact.value !== undefined && fact.value !== '')
                .map((fact) => (
                  <div key={fact.path} className="rounded-2xl bg-surface p-5">
                    <dd className="font-semibold">{fact.value}</dd>
                    <dt className="text-sm opacity-70">
                      <CmsField path={fact.path} label={String(fact.path)}>{labels[fact.path]}</CmsField>
                    </dt>
                  </div>
                ))}
            </dl>
          </section>
        </CmsSection>
      )}

      <CmsSection sectionKey="values" title="Values" page={PAGE}>
        <section className="bg-surface px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-3xl font-bold">
              <CmsField path="title" label="Title">{values.title}</CmsField>
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {values.items.map((item, i) => (
                <div key={item.id} className="rounded-2xl border border-black/10 bg-page p-6">
                  <CmsField path={`items.${i}.icon`} label="Icon">
                    <CmsIcon name={item.icon} className="mb-3 h-6 w-6 text-brand" />
                  </CmsField>
                  <h3 className="mb-1 font-semibold">
                    <CmsField path={`items.${i}.title`} label="Value title">{item.title}</CmsField>
                  </h3>
                  <p className="text-sm opacity-80">
                    <CmsField path={`items.${i}.text`} label="Value text">{item.text}</CmsField>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </CmsSection>

      {(leadership.length > 0 || inEditor) && (
        <CmsSection sectionKey="leadership" title="Leadership messages" page={PAGE}>
          <section className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="mb-8 text-3xl font-bold">
              <CmsField path="title" label="Title">{leadershipText.title}</CmsField>
            </h2>
            {leadership.length === 0 && <EmptyInEditor source="Leadership Messages" />}
            <div className="space-y-10">
              {leadership.map((m) => (
                <article key={m.id} className="grid gap-6 md:grid-cols-[160px_1fr]">
                  {m.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo_url} alt={m.author_name} className="aspect-square w-40 rounded-2xl object-cover" />
                  )}
                  <div>
                    {m.title && <h3 className="mb-3 text-xl font-semibold">{m.title}</h3>}
                    <RichText html={m.content} className="space-y-3 opacity-90" />
                    {m.signature_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.signature_url} alt="" className="mt-4 h-10 w-auto" />
                    )}
                    <p className="mt-3 font-semibold">{m.author_name}</p>
                    {m.author_role && <p className="text-sm opacity-70">{m.author_role}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </CmsSection>
      )}

      {(teamGroups.length > 0 || inEditor) && (
        <CmsSection sectionKey="team" title="Team" page={PAGE}>
          <section className="bg-surface px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-8 text-3xl font-bold">
                <CmsField path="title" label="Title">{team.title}</CmsField>
              </h2>
              {teamGroups.length === 0 && <EmptyInEditor source="Team" />}
              {teamGroups.map(([group, members]) => (
                <div key={group} className="mb-10 last:mb-0">
                  {teamGroups.length > 1 && <h3 className="mb-4 text-lg font-semibold">{group || team.otherGroup}</h3>}
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {members.map((m) => (
                      <li key={m.id} className="rounded-2xl border border-black/10 bg-page p-5 text-center">
                        {m.image_data?.file_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.image_data.file_url}
                            alt={m.image_data.alt_text || m.fullname}
                            className={`mx-auto mb-3 h-24 w-24 object-cover ${m.image_shape === 'square' ? 'rounded-xl' : 'rounded-full'}`}
                          />
                        )}
                        <p className="font-semibold">{m.fullname}</p>
                        <p className="text-sm opacity-70">{m.designation}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </CmsSection>
      )}
    </main>
  );
}
