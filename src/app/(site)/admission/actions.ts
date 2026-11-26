'use server';

import { storio } from '@storio/template-sdk';

import { admissionFields, cleanAdmissionValues, loadAdmissionFormConfig, type AdmissionValues } from '@/lib/admission';
import { resolveTenant } from '@/lib/tenant';

/**
 * ============================================================================
 * Online admission: three SDK calls, run on the server (Server Actions)
 * ============================================================================
 * 1. sendAdmissionCode -> storio.sendAdmissionOTP: emails a one-time code.
 * 2. submitAdmission   -> storio.verifyAdmissionOTP, then storio.submitAdmissionApplication.
 *
 * Standalone Preview never contacts Storio: the code is always 123456 and the
 * application gets a demo number, so the whole flow can be tried locally.
 * ============================================================================
 */

// A "use server" file may export async functions only, so this stays private.
const DEMO_OTP = '123456';

export interface AdmissionResult {
  ok: boolean;
  /** The school's message, or a short reason. */
  message?: string;
  applicationNumber?: string;
  /** Labels of required fields that are empty. */
  missing?: string[];
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendAdmissionCode(email: string, phone: string): Promise<AdmissionResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL.test(cleanEmail)) return { ok: false, message: 'invalid_email' };

  const { tenantHost, isStandalone } = await resolveTenant();
  if (isStandalone) return { ok: true, message: `Standalone Preview: use the code ${DEMO_OTP}.` };

  const cleanPhone = phone.trim();
  const result = cleanPhone
    ? await storio.sendAdmissionOTP(cleanEmail, cleanPhone, tenantHost).catch(() => null)
    : await storio.sendAdmissionOTP(cleanEmail, tenantHost).catch(() => null);
  return { ok: !!result?.success, message: result?.message };
}

export async function submitAdmission(email: string, code: string, values: AdmissionValues): Promise<AdmissionResult> {
  const cleanEmail = email.trim().toLowerCase();
  const otp = code.trim();
  if (!EMAIL.test(cleanEmail) || !/^\d{4,8}$/.test(otp)) return { ok: false, message: 'invalid_code' };

  const ctx = await resolveTenant();
  // Only the school's own form fields are sent, and required ones must be filled.
  const fields = admissionFields(await loadAdmissionFormConfig(ctx));
  const { clean, missing } = cleanAdmissionValues(fields, values);
  if (missing.length > 0) return { ok: false, missing };

  if (ctx.isStandalone) {
    return otp === DEMO_OTP ? { ok: true, applicationNumber: 'DEMO-2027-0001' } : { ok: false, message: 'invalid_code' };
  }

  const verified = await storio.verifyAdmissionOTP(cleanEmail, otp, ctx.tenantHost).catch(() => null);
  if (!verified?.success) return { ok: false, message: verified?.message || 'invalid_code' };

  const result = await storio.submitAdmissionApplication({ ...clean, email: cleanEmail }, otp, ctx.tenantHost).catch(() => null);
  if (!result || result.success === false || result.error) return { ok: false, message: result?.error || result?.message };
  return { ok: true, applicationNumber: result.application_number, message: result.message };
}
