'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getAdmissionFormConfig()                ->  StorioAdmissionFormConfig | null
 *     loadAdmissionFormConfig() in src/lib/admission.ts
 *   storio.sendAdmissionOTP(email, phone?)         ->  StorioAdmissionOTPResponse | null
 *     sendAdmissionCode() in src/app/(site)/admission/actions.ts
 *   storio.verifyAdmissionOTP(email, code)         ->  StorioAdmissionOTPResponse | null
 *     submitAdmission() in src/app/(site)/admission/actions.ts
 *   storio.submitAdmissionApplication(data, code)  ->  StorioAdmissionApplicationResponse | null
 *     submitAdmission() in src/app/(site)/admission/actions.ts
 */

import { useState, useTransition } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { StorioAdmissionField } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { sendAdmissionCode, submitAdmission, type AdmissionResult } from '@/app/(site)/admission/actions';
import { useAdmissionText } from '@/components/cms/useAdmissionText';
import type { AdmissionValues } from '@/lib/admission';

const PAGE = 'template-0-starter-admission';

type Step = 'form' | 'code' | 'done';

const inputClass = 'w-full rounded-lg border border-black/15 bg-page px-3 py-2';

/**
 * Online admission (getAdmissionFormConfig + the three admission actions).
 * The fields are not written in the template: they come from the school's form builder, so this
 * View renders each field by its type. All texts around the form are editable page content.
 */
export function AdmissionView({ fields }: { fields: StorioAdmissionField[] }) {
  const { intro, form, success } = useAdmissionText();
  const [step, setStep] = useState<Step>('form');
  const [values, setValues] = useState<AdmissionValues>({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<AdmissionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (id: string, value: string | boolean) => setValues((v) => ({ ...v, [id]: value }));

  // Most schools' forms already ask for an email (and a phone): those fields are used for the
  // verification code, and the template's own email/phone inputs are shown only when missing.
  const emailField = fields.find((f) => f.type === 'email');
  const phoneField = fields.find((f) => f.type === 'tel');
  const otpEmail = emailField ? String(values[emailField.id] ?? '') : email;
  const otpPhone = phoneField ? String(values[phoneField.id] ?? '') : phone;

  const onSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await sendAdmissionCode(otpEmail, otpPhone);
      setResult(res);
      if (res.ok) setStep('code');
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitAdmission(otpEmail, code, values);
      setResult(res);
      if (res.ok) setStep('done');
      else if (res.missing?.length) setStep('form');
    });
  };

  const error = result && !result.ok && (
    <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
      {result.missing?.length ? (
        <>
          <CmsField path="missingText" label="Missing fields text">{form.missingText}</CmsField> {result.missing.join(', ')}
        </>
      ) : (
        <CmsField path="errorText" label="Error text">{form.errorText}</CmsField>
      )}
    </div>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Intro" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            {fields.length === 0 ? (
              <CmsField path="closedText" label="Closed text">{intro.closedText}</CmsField>
            ) : (
              <CmsField path="text" label="Text">{intro.text}</CmsField>
            )}
          </p>
        </header>
      </CmsSection>

      {fields.length > 0 && step !== 'done' && (
        <CmsSection sectionKey="form" title="Form" page={PAGE}>
          {step === 'form' ? (
            <form onSubmit={onSendCode} className="space-y-8">
              <fieldset className="space-y-4">
                <legend className="mb-2 text-xl font-semibold">
                  <CmsField path="applicantTitle" label="Applicant title">{form.applicantTitle}</CmsField>
                </legend>
                {fields.map((field) => (
                  <AdmissionInput key={field.id} field={field} value={values[field.id]} onChange={set} placeholder={form.selectPlaceholder} />
                ))}
              </fieldset>
              {(!emailField || !phoneField) && (
                <fieldset className="space-y-4">
                  <legend className="mb-2 text-xl font-semibold">
                    <CmsField path="contactTitle" label="Contact title">{form.contactTitle}</CmsField>
                  </legend>
                  {!emailField && (
                    <label className="block space-y-1">
                      <span className="text-sm font-semibold">
                        <CmsField path="emailLabel" label="Email label">{form.emailLabel}</CmsField> *
                      </span>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                    </label>
                  )}
                  {!phoneField && (
                    <label className="block space-y-1">
                      <span className="text-sm font-semibold">
                        <CmsField path="phoneLabel" label="Phone label">{form.phoneLabel}</CmsField>
                      </span>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                    </label>
                  )}
                </fieldset>
              )}
              {error}
              <button type="submit" disabled={pending} className="rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-60">
                <CmsField path="sendCodeText" label="Send code button">{form.sendCodeText}</CmsField>
              </button>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-black/10 p-6">
              <h2 className="text-xl font-semibold">
                <CmsField path="codeTitle" label="Code title">{form.codeTitle}</CmsField>
              </h2>
              <p className="opacity-80">
                <CmsField path="codeText" label="Code text">{form.codeText}</CmsField>
              </p>
              {result?.ok && result.message && <p className="text-sm text-brand">{result.message}</p>}
              <label className="block space-y-1">
                <span className="text-sm font-semibold">
                  <CmsField path="codeLabel" label="Code label">{form.codeLabel}</CmsField>
                </span>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  pattern="\d{4,8}"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`${inputClass} max-w-48 tracking-widest`}
                />
              </label>
              {error}
              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" disabled={pending} className="rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-60">
                  <CmsField path="submitText" label="Submit button">{form.submitText}</CmsField>
                </button>
                <button type="button" onClick={() => { setStep('form'); setResult(null); }} className="text-sm font-semibold text-brand">
                  <CmsField path="changeEmailText" label="Change email link">{form.changeEmailText}</CmsField>
                </button>
              </div>
            </form>
          )}
        </CmsSection>
      )}

      {step === 'done' && (
        <CmsSection sectionKey="success" title="Success" page={PAGE}>
          <div className="space-y-3 rounded-2xl bg-surface p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand" aria-hidden />
            <h2 className="text-2xl font-bold">
              <CmsField path="title" label="Title">{success.title}</CmsField>
            </h2>
            <p className="opacity-80">
              <CmsField path="text" label="Text">{success.text}</CmsField>
            </p>
            {result?.applicationNumber && (
              <p>
                <CmsField path="numberLabel" label="Number label">{success.numberLabel}</CmsField>:{' '}
                <strong className="font-mono text-lg">{result.applicationNumber}</strong>
              </p>
            )}
          </div>
        </CmsSection>
      )}
    </main>
  );
}

/** One field of the school's form, drawn by its type. Unknown types fall back to a text input. */
function AdmissionInput({
  field,
  value,
  onChange,
  placeholder,
}: {
  field: StorioAdmissionField;
  value: string | boolean | undefined;
  onChange: (id: string, value: string | boolean) => void;
  placeholder: string;
}) {
  const text = typeof value === 'string' ? value : '';
  const label = (
    <span className="text-sm font-semibold">
      {field.label}
      {field.required ? ' *' : ''}
    </span>
  );

  switch (field.type) {
    case 'checkbox':
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={value === true} required={field.required} onChange={(e) => onChange(field.id, e.target.checked)} />
          {label}
        </label>
      );
    case 'radio':
      return (
        <fieldset className="space-y-1">
          <legend>{label}</legend>
          <div className="flex flex-wrap gap-4">
            {(field.options ?? []).map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input type="radio" name={field.id} value={option} checked={text === option} required={field.required} onChange={() => onChange(field.id, option)} />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case 'select':
    case 'dropdown':
      return (
        <label className="block space-y-1">
          {label}
          <select value={text} required={field.required} onChange={(e) => onChange(field.id, e.target.value)} className={inputClass}>
            <option value="">{placeholder}</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      );
    case 'textarea':
      return (
        <label className="block space-y-1">
          {label}
          <textarea rows={3} value={text} required={field.required} onChange={(e) => onChange(field.id, e.target.value)} className={inputClass} />
        </label>
      );
    default: {
      const types = ['text', 'email', 'tel', 'number', 'date', 'url'];
      const type = field.type && types.includes(field.type) ? field.type : 'text';
      return (
        <label className="block space-y-1">
          {label}
          <input type={type} value={text} required={field.required} onChange={(e) => onChange(field.id, e.target.value)} className={inputClass} />
        </label>
      );
    }
  }
}
