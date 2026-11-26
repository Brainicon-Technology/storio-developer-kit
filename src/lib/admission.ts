import { storio, type StorioAdmissionField, type StorioAdmissionFormConfig } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/**
 * The admission form the school designed in the dashboard (Admission > Form builder).
 * Returns null when the school has no active form: the page then shows "admissions closed".
 */
export async function loadAdmissionFormConfig(ctx: TenantContext): Promise<StorioAdmissionFormConfig | null> {
  const real = await safely(storio.getAdmissionFormConfig(ctx.tenantHost));
  const usable = real && real.is_active !== false && Array.isArray(real.fields) && real.fields.length > 0 ? real : null;
  return withDemoRecord(usable, DEFAULT_DEMO_DATA.admissionFormConfig, ctx.isStandalone);
}

/** The form's fields in the school's order. */
export function admissionFields(config: StorioAdmissionFormConfig | null): StorioAdmissionField[] {
  return [...(config?.fields ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** The values an applicant may send: only the form's own fields, as text or true/false. */
export type AdmissionValues = Record<string, string | boolean>;

/**
 * Keeps only the fields of the form, trims the texts, and lists the required fields that are
 * still empty. Run on the server before sending anything to Storio: never trust the browser.
 */
export function cleanAdmissionValues(fields: StorioAdmissionField[], values: AdmissionValues): { clean: AdmissionValues; missing: string[] } {
  const clean: AdmissionValues = {};
  const missing: string[] = [];
  for (const field of fields) {
    const raw = values[field.id];
    let value = typeof raw === 'boolean' ? raw : typeof raw === 'string' ? raw.trim().slice(0, 2000) : '';
    // A choice field accepts only one of its options.
    if (field.options?.length && typeof value === 'string' && !field.options.includes(value)) value = '';
    clean[field.id] = value;
    if (field.required && (value === '' || value === false)) missing.push(field.label);
  }
  return { clean, missing };
}
