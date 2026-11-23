'use client';

import { useActionState } from 'react';
import { CmsField, CmsSection, usePageContent, useSiteContent } from '@brainicon/storio-elements-editor/site';

import { sendContactMessage, type ContactFormState } from '@/app/(site)/contact/actions';
import type contactDefaults from '@/content/contact.json';
import type siteDefaults from '@/content/site.json';

type ContactContent = typeof contactDefaults;
type SiteContent = typeof siteDefaults;

const initialState: ContactFormState = { status: 'idle' };

/**
 * Contact page. Shows:
 * - site-wide contact details reused in a page body (<CmsField page="site" section="contact">),
 * - form labels as editable content, while the form posts to the tenant via a Server Action.
 */
export function ContactView() {
  const { intro, form } = usePageContent<ContactContent>('contact');
  const { contact } = useSiteContent<SiteContent>();
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
      <CmsSection sectionKey="intro" title="Intro">
        <section className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="text-lg opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
          <ul className="space-y-1 pt-4 text-sm">
            <li><CmsField page="site" section="contact" path="email" label="Email">{contact.email}</CmsField></li>
            <li><CmsField page="site" section="contact" path="phone" label="Phone">{contact.phone}</CmsField></li>
            <li><CmsField page="site" section="contact" path="address" label="Address">{contact.address}</CmsField></li>
          </ul>
        </section>
      </CmsSection>

      <CmsSection sectionKey="form" title="Form">
        <form action={formAction} className="space-y-4 rounded-2xl border border-black/10 bg-surface p-6">
          <label className="block text-sm font-medium">
            <CmsField path="nameLabel" label="Name label">{form.nameLabel}</CmsField>
            <input name="name" required className="mt-1 w-full rounded-lg border border-black/20 bg-page px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            <CmsField path="emailLabel" label="Email label">{form.emailLabel}</CmsField>
            <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-black/20 bg-page px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            <CmsField path="messageLabel" label="Message label">{form.messageLabel}</CmsField>
            <textarea name="message" rows={5} required className="mt-1 w-full rounded-lg border border-black/20 bg-page px-3 py-2" />
          </label>
          <button type="submit" disabled={pending} className="rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-60">
            <CmsField path="submitLabel" label="Button">{form.submitLabel}</CmsField>
          </button>
          {state.status === 'success' && (
            <p className="text-sm text-brand"><CmsField path="successText" label="Success text">{form.successText}</CmsField></p>
          )}
          {state.status === 'error' && (
            <p className="text-sm text-red-600"><CmsField path="errorText" label="Error text">{form.errorText}</CmsField></p>
          )}
        </form>
      </CmsSection>
    </main>
  );
}
