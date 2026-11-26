import { cache } from 'react';
import { storio, type StorioForm, type StorioFormElement } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import { mediaUrl } from './normalize';
import type { TenantContext } from './tenant';

/**
 * Dynamic Form Builder (dashboard: Forms). The school builds forms itself; the template renders them:
 *
 *   storio.getForms()                                  ->  StorioForm[]               (active forms)
 *   storio.getForm(code)                               ->  StorioForm | null          (403 when closed)
 *   storio.uploadFormFile(code, file, fieldId, host)   ->  StorioFormUploadResponse   (a file/image field)
 *   storio.submitFormResponse({ form, answers }, host) ->  StorioFormSubmitResponse
 *
 * `elements` describe the fields: { id, type, label, name, required, options, placeholder, helpText }.
 * Answers are keyed by the element's `id`. Uploads come first; their `url` goes into the answers.
 * See src/app/(site)/forms/actions.ts.
 */

const withHeaderImage = (form: StorioForm): StorioForm => ({
  ...form,
  header_image_data: form.header_image_data ? { ...form.header_image_data, file_url: mediaUrl(form.header_image_data) ?? '' } : null,
});

export async function loadForms(ctx: TenantContext): Promise<StorioForm[]> {
  const real = (await safely(storio.getForms(ctx.tenantHost)))?.filter((f) => f.status === 'active').map(withHeaderImage) ?? null;
  return withDemoFallback(real, DEFAULT_DEMO_DATA.forms, ctx.isStandalone);
}

export const loadForm = cache(async function loadForm(code: string, ctx: TenantContext): Promise<StorioForm | null> {
  const real = await safely(storio.getForm(code, ctx.tenantHost));
  return withDemoRecord(real ? withHeaderImage(real) : null, DEFAULT_DEMO_DATA.forms.find((f) => f.code === code), ctx.isStandalone);
});

/** Elements a visitor fills in (headings, header images and hidden values are not inputs). */
export const INPUT_TYPES = ['text', 'email', 'phone', 'password', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'image'];
export const isInput = (element: StorioFormElement) => INPUT_TYPES.includes(element.type);
export const isUpload = (element: StorioFormElement) => element.type === 'file' || element.type === 'image';
