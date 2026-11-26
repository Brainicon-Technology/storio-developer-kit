'use server';

import { storio, type StorioFormSubmitPayload } from '@storio/template-sdk';

import { isInput, isUpload, loadForm } from '@/lib/forms';
import { resolveTenant } from '@/lib/tenant';

export interface FormSubmitState {
  status: 'idle' | 'success' | 'error';
  /** The school's own success text (form settings), when it has one. */
  message?: string;
  /** Element ids of required fields left empty. */
  missing?: string[];
}

/**
 * Sends one Dynamic Form Builder form (Server Action):
 * 1. reloads the form (getForm) so only its real fields are read and required ones are checked,
 * 2. uploads each chosen file with storio.uploadFormFile(code, file, elementId, host) and puts the
 *    returned url into the answers,
 * 3. sends { form: code, answers } with storio.submitFormResponse.
 * In Standalone Preview it never contacts Storio: it answers "success" for the demo form.
 */
export async function submitForm(code: string, _prev: FormSubmitState, formData: FormData): Promise<FormSubmitState> {
  const ctx = await resolveTenant();
  const form = await loadForm(code, ctx);
  if (!form) return { status: 'error' };

  const answers: StorioFormSubmitPayload['answers'] = {};
  const missing: string[] = [];
  const files: { id: string; file: File }[] = [];

  for (const element of form.elements) {
    if (element.type === 'hidden') {
      answers[element.id] = typeof element.defaultValue === 'string' ? element.defaultValue : (element.value ?? null);
      continue;
    }
    if (!isInput(element)) continue;

    if (isUpload(element)) {
      const chosen = formData.getAll(element.id).filter((v): v is File => v instanceof File && v.size > 0);
      if (chosen.length === 0 && element.required) missing.push(element.id);
      chosen.forEach((file) => files.push({ id: element.id, file }));
      continue;
    }

    const values = formData.getAll(element.id).map(String).filter((v) => v.trim() !== '');
    if (values.length === 0) {
      if (element.required) missing.push(element.id);
      continue;
    }
    if (element.type === 'checkbox') answers[element.id] = element.options?.length ? values : true;
    else if (element.type === 'number') answers[element.id] = Number(values[0]);
    else answers[element.id] = values[0];
  }

  if (missing.length) return { status: 'error', missing };
  if (ctx.isStandalone) return { status: 'success', message: form.settings?.successMessage };

  for (const { id, file } of files) {
    const uploaded = await storio.uploadFormFile(code, file, id, ctx.tenantHost).catch(() => null);
    if (!uploaded) return { status: 'error' };
    const previous = answers[id];
    answers[id] = Array.isArray(previous) ? [...previous, uploaded.url] : typeof previous === 'string' ? [previous, uploaded.url] : uploaded.url;
  }

  const sent = await storio.submitFormResponse({ form: code, answers }, ctx.tenantHost).catch(() => null);
  if (!sent) return { status: 'error' };
  return { status: 'success', message: form.settings?.successMessage || form.settings?.confirmation_message };
}
