'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getHeroSlides()      ->  StorioHeroSlide[]
 *     loadHeroSlides() in src/lib/home.ts
 *   storio.getNotices()         ->  StorioNotice[]
 *     loadNotices() in src/lib/notices.ts
 *   storio.getTestimonials()    ->  StorioTestimonial[]
 *     loadTestimonials() in src/lib/home.ts
 *   storio.getFaqs()            ->  StorioFaq[]
 *     loadFaqs() in src/lib/faqs.ts
 *   storio.getImportantLinks()  ->  StorioImportantLink[]
 *     loadImportantLinks() in src/lib/home.ts
 */

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ExternalLink, Quote, Star } from 'lucide-react';
import type { StorioFaq, StorioHeroSlide, StorioImportantLink, StorioNotice, StorioTestimonial } from '@storio/template-sdk';
import { formatDate } from '@/lib/format';
import { CmsField, CmsIcon, CmsSection } from '@/lib/storio-editor/site';

import { EmptyInEditor, useInEditor } from '@/components/cms/EditorOnly';
import { useHomeText } from '@/components/cms/useHomeText';

const PAGE = 'template-10-starter-home';

export interface HomeData {
  slides: StorioHeroSlide[];
  notices: StorioNotice[];
  testimonials: StorioTestimonial[];
  faqs: StorioFaq[];
  links: StorioImportantLink[];
}

/**
 * Home page. Rules shown here:
 * - one <CmsSection page={PAGE}> per top-level key of src/content/template-10-starter-home.json,
 * - a <CmsField> around every visible value, with list positions for arrays (items.0.title),
 * - icons stored by name and drawn with <CmsIcon>,
 * - Storio records (notices) edited as records (collection="notice"), not as page content,
 * - other school data (slides, testimonials, FAQs, links) shown as is: edited on the dashboard.
 *   A section whose data is empty on a real school is hidden, except where an empty text says so.
 */
export function HomeView({ slides, notices, testimonials, faqs, links }: HomeData) {
  const text = useHomeText();
  const inEditor = useInEditor();
  const { hero, features, notices: noticesSection, faq } = text;

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

      {(slides.length > 0 || inEditor) && (
        <CmsSection sectionKey="slides" title="Highlights" page={PAGE}>
          {slides.length > 0 ? (
            <SlidesCarousel slides={slides} text={text.slides} />
          ) : (
            <section className="mx-auto max-w-6xl px-6 pb-16">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
                <CmsField path="title" label="Title">{text.slides.title}</CmsField>
              </h2>
              <EmptyInEditor source="Hero Slides" />
            </section>
          )}
        </CmsSection>
      )}

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
                  {notice.published_date && <p className="mt-1 text-xs opacity-60">{formatDate(notice.published_date)}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </CmsSection>

      {(testimonials.length > 0 || inEditor) && (
        <CmsSection sectionKey="testimonials" title="Testimonials" page={PAGE}>
          <section className="bg-surface px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold">
                <CmsField path="title" label="Title">{text.testimonials.title}</CmsField>
              </h2>
              <p className="mb-8 mt-2 opacity-80">
                <CmsField path="text" label="Text">{text.testimonials.text}</CmsField>
              </p>
              {testimonials.length === 0 && <EmptyInEditor source="Testimonials" />}
              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.map((t) => (
                  <figure key={t.id} className="flex flex-col rounded-2xl border border-black/10 bg-page p-6">
                    <Quote className="mb-3 h-6 w-6 text-accent" aria-hidden />
                    <blockquote className="flex-1 opacity-90">{t.message}</blockquote>
                    {t.rating ? (
                      <div className="mt-4 flex gap-0.5" aria-label={`${t.rating} / 5`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < (t.rating ?? 0) ? 'fill-accent text-accent' : 'text-black/20'}`} aria-hidden />
                        ))}
                      </div>
                    ) : null}
                    <figcaption className="mt-4 flex items-center gap-3">
                      {t.photo_data?.file_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.photo_data.file_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                      )}
                      <span>
                        <span className="block font-semibold">{t.name}</span>
                        {(t.designation || t.organization) && (
                          <span className="block text-sm opacity-70">{[t.designation, t.organization].filter(Boolean).join(', ')}</span>
                        )}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        </CmsSection>
      )}

      {(faqs.length > 0 || inEditor) && (
        <CmsSection sectionKey="faq" title="FAQ" page={PAGE}>
          <section className="mx-auto max-w-3xl px-6 py-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold">
                <CmsField path="title" label="Title">{faq.title}</CmsField>
              </h2>
              <Link href="/faq" className="text-sm font-semibold text-brand">
                <CmsField path="linkText" label="Link">{faq.linkText}</CmsField>
              </Link>
            </div>
            {faqs.length === 0 && <EmptyInEditor source="FAQ" />}
            <div className="space-y-4">
              {faqs.map((item) => (
                <details key={item.id} className="rounded-xl border border-black/10 p-4">
                  <summary className="cursor-pointer font-semibold">{item.question}</summary>
                  <p className="mt-2 opacity-80">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </CmsSection>
      )}

      {(links.length > 0 || inEditor) && (
        <CmsSection sectionKey="links" title="Important links" page={PAGE}>
          <section className="mx-auto max-w-6xl px-6 pb-16">
            <h2 className="mb-4 text-xl font-bold">
              <CmsField path="title" label="Title">{text.links.title}</CmsField>
            </h2>
            {links.length === 0 && <EmptyInEditor source="Important Links" />}
            <ul className="flex flex-wrap gap-3">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-brand hover:text-brand"
                  >
                    {link.title}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </CmsSection>
      )}
    </main>
  );
}

/** Hero slides from the dashboard, one at a time. The slide texts are school data (no pencil). */
function SlidesCarousel({ slides, text }: { slides: StorioHeroSlide[]; text: { title: string; previousLabel: string; nextLabel: string } }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index % slides.length];
  const go = (step: number) => setIndex((i) => (i + step + slides.length) % slides.length);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
        <CmsField path="title" label="Title">{text.title}</CmsField>
      </h2>
      <div className="relative overflow-hidden rounded-2xl bg-ink text-white">
        {slide.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        )}
        <div className="relative flex min-h-72 flex-col justify-end gap-3 p-8 md:p-12">
          {slide.title && <p className="text-3xl font-extrabold md:text-4xl">{slide.title}</p>}
          {slide.subtitle && <p className="max-w-xl text-lg opacity-90">{slide.subtitle}</p>}
          {slide.button_text && slide.button_url && (
            <Link href={slide.button_url} className="w-fit rounded-xl bg-page px-5 py-3 font-semibold text-brand">
              {slide.button_text}
            </Link>
          )}
        </div>
        {slides.length > 1 && (
          <div className="absolute right-4 top-4 flex gap-2">
            <button type="button" onClick={() => go(-1)} aria-label={text.previousLabel} className="rounded-full bg-black/40 p-2 hover:bg-black/60">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={text.nextLabel} className="rounded-full bg-black/40 p-2 hover:bg-black/60">
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
