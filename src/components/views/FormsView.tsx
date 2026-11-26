'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getForms()  ->  StorioForm[]
 *     loadForms() in src/lib/forms.ts
 */

import Link from 'next/link';
import type { StorioForm } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { useFormsText } from '@/components/cms/useFormsText';

const PAGE = 'template-10-starter-forms';

/** The school's online forms (Dynamic Form Builder). Each one opens at /forms/<code>. */
export function FormsView({ forms }: { forms: StorioForm[] }) {
  const { intro } = useFormsText();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Intro" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>

        {forms.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {forms.map((form) => (
              <li key={form.code} className="flex flex-col rounded-2xl border border-black/10 p-6">
                <h2 className="text-xl font-semibold">{form.title}</h2>
                {form.description && <p className="mt-2 flex-1 text-sm opacity-80">{form.description}</p>}
                <Link href={`/forms/${encodeURIComponent(form.code)}`} className="mt-4 text-sm font-semibold text-brand">
                  <CmsField path="openText" label="Open link">{intro.openText}</CmsField>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CmsSection>
    </main>
  );
}
