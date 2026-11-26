'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getLayout()                     ->  StorioLayoutResponse (its settings: contact details)
 *     loadLayout() in src/lib/site.ts (falls back to getSettings + getCustomization + getNavigation)
 *   storio.submitContactMessage(formData)  ->  StorioContactFormResponse | null
 *     sendContactMessage() in src/app/(site)/contact/actions.ts
 */

import { useActionState } from 'react';
import type { StorioSettingsResponse } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { sendContactMessage, type ContactFormState } from '@/app/(site)/contact/actions';
import { useContactText } from '@/components/cms/useContactText';

const PAGE = 'template-0-starter-contact';

const initialState: ContactFormState = { status: 'idle' };

/**
 * Contact page. Shows:
 * - the school's contact details from its settings (SDK data: no pencil),
 * - form labels as editable content, while the form posts to the tenant via a Server Action.
 */
export function ContactView({ settings }: { settings: StorioSettingsResponse | null }) {
  const { intro, form } = useContactText();
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
      <CmsSection sectionKey="intro" title="Intro" page={PAGE}>
        <section className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="text-lg opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
          <ul className="space-y-1 pt-4 text-sm">
            {settings?.contact_email && <li>{settings.contact_email}</li>}
            {settings?.phone_number && <li>{settings.phone_number}</li>}
            {settings?.mailing_address && <li>{settings.mailing_address}</li>}
          </ul>
        </section>
      </CmsSection>

      <CmsSection sectionKey="form" title="Form" page={PAGE}>
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
