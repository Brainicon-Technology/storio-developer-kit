'use server';

import { storio } from '@storio/template-sdk';

import { resolveTenant } from '@/lib/tenant';

export interface ContactFormState {
  status: 'idle' | 'success' | 'error';
}

/** Sends the contact form to the tenant with the SDK. Standalone Preview only pretends. */
export async function sendContactMessage(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  if (!name || !email || !message) return { status: 'error' };

  const { tenantHost, isStandalone } = await resolveTenant();
  if (isStandalone) return { status: 'success' };

  const result = await storio.submitContactMessage({ name, email, message }, tenantHost);
  return { status: result?.success ? 'success' : 'error' };
}
