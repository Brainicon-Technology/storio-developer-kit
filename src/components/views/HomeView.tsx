'use client';

import Link from 'next/link';
import type { StorioNotice } from '@storio/template-sdk';
import { CmsField, CmsIcon, CmsSection } from '@/lib/storio-editor/site';

import { useHomeText } from '@/components/cms/useHomeText';

const PAGE = 'template-0-starter-home';

/**
 * Home page. Rules shown here:
 * - one <CmsSection page={PAGE}> per top-level key of src/content/template-0-starter-home.json,
 * - a <CmsField> around every visible value, with list positions for arrays (items.0.title),
 * - icons stored by name and drawn with <CmsIcon>,
 * - Storio records (notices) edited as records (collection="notice"), not as page content.
 */
export function HomeView({ notices }: { notices: StorioNotice[] }) {
  const { hero, features, notices: noticesSection, faq } = useHomeText();

  return (
    <main>
      <CmsSection sectionKey="hero" title="Hero" page={PAGE}>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
          <div className="space-y-5">
            {hero.badge && (
              <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                <CmsField path="badge" label="Badge">{hero.badge}</CmsField>
              </span>
            )}
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              <CmsField path="title" label="Title">{hero.title}</CmsField>
            </h1>
            <p className="text-lg opacity-80">
              <CmsField path="subtitle" label="Subtitle">{hero.subtitle}</CmsField>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={hero.primaryHref} className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">
                <CmsField path="primaryText" label="Main button">{hero.primaryText}</CmsField>
              </Link>
              <Link href={hero.secondaryHref} className="rounded-xl border border-brand px-5 py-3 font-semibold text-brand">
                <CmsField path="secondaryText" label="Second button">{hero.secondaryText}</CmsField>
              </Link>
            </div>
          </div>
          {hero.heroImage && (
            <CmsField path="heroImage" label="Image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.heroImage} alt="" className="aspect-video w-full rounded-2xl object-cover shadow-xl" />
            </CmsField>
          )}
        </section>
      </CmsSection>

      <CmsSection sectionKey="features" title="Features" page={PAGE}>
        <section className="bg-surface px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-3xl font-bold">
              <CmsField path="title" label="Title">{features.title}</CmsField>
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {features.items.map((item, i) => (
                <div key={item.id} className="rounded-2xl border border-black/10 bg-page p-6">
                  <CmsField path={`items.${i}.icon`} label="Icon">
                    <CmsIcon name={item.icon} className="mb-3 h-6 w-6 text-brand" />
                  </CmsField>
                  <h3 className="mb-1 font-semibold">
                    <CmsField path={`items.${i}.title`} label="Card title">{item.title}</CmsField>
                  </h3>
                  <p className="text-sm opacity-80">
                    <CmsField path={`items.${i}.text`} label="Card text">{item.text}</CmsField>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </CmsSection>

      <CmsSection sectionKey="notices" title="Latest notices" page={PAGE}>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              <CmsField path="title" label="Title">{noticesSection.title}</CmsField>
            </h2>
            <Link href="/notices" className="text-sm font-semibold text-brand">
              <CmsField path="linkText" label="Link">{noticesSection.linkText}</CmsField>
            </Link>
          </div>
          {notices.length === 0 ? (
            <p className="opacity-70">
              <CmsField path="emptyText" label="Empty text">{noticesSection.emptyText}</CmsField>
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-3">
              {notices.map((notice) => (
                <li key={notice.id} className="rounded-xl border border-black/10 p-5">
                  <Link href={`/notices/${notice.id}`} className="font-semibold hover:text-brand">
                    {/* A field of a database record: collection + item + path. */}
                    <CmsField collection="notice" item={String(notice.id)} path="title" label="Notice title">
                      {notice.title}
                    </CmsField>
                  </Link>
                  {notice.published_date && <p className="mt-1 text-xs opacity-60">{notice.published_date}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </CmsSection>

      <CmsSection sectionKey="faq" title="FAQ" page={PAGE}>
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-6 text-3xl font-bold">
            <CmsField path="title" label="Title">{faq.title}</CmsField>
          </h2>
          <div className="space-y-4">
            {faq.items.map((item, i) => (
              <details key={i} className="rounded-xl border border-black/10 p-4">
                <summary className="cursor-pointer font-semibold">
                  <CmsField path={`items.${i}.question`} label="Question">{item.question}</CmsField>
                </summary>
                <p className="mt-2 opacity-80">
                  <CmsField path={`items.${i}.answer`} label="Answer">{item.answer}</CmsField>
                </p>
              </details>
            ))}
          </div>
        </section>
      </CmsSection>
    </main>
  );
}
