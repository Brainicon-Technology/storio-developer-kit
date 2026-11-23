'use client';

import { CmsField, CmsIcon, CmsSection, usePageContent } from '@brainicon/storio-elements-editor/site';

import type aboutDefaults from '@/content/about.json';

type AboutContent = typeof aboutDefaults;

/** A simple static page: content only, no tenant records. */
export function AboutView() {
  const { intro, values } = usePageContent<AboutContent>('about');

  return (
    <main>
      <CmsSection sectionKey="intro" title="Intro">
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

      <CmsSection sectionKey="values" title="Values">
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
    </main>
  );
}
