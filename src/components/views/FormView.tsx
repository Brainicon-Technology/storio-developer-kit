'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getForm(code)                 ->  StorioForm | null
 *     loadForm() in src/lib/forms.ts
 *   storio.uploadFormFile(code, file...) ->  StorioFormUploadResponse | null
 *   storio.submitFormResponse(payload)   ->  StorioFormSubmitResponse | null
 *     submitForm() in src/app/(site)/forms/actions.ts
 */

import { useActionState } from 'react';
import Link from 'next/link';
import type { StorioForm, StorioFormElement } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { submitForm, type FormSubmitState } from '@/app/(site)/forms/actions';
import { useFormsText } from '@/components/cms/useFormsText';

/**
 * One Dynamic Form Builder form at /forms/<code>.
 *
 * Its fields (labels, placeholders, help texts, options) are the school's data: they come from
 * the form itself and get no pencil. The template's own texts (back link, button, messages) live
 * in the "detail" section of the Online forms page (/forms cannot have a [code] editor page).
 */
const LIST_PAGE = 'template-10-starter-forms';
const initialState: FormSubmitState = { status: 'idle' };
const field = 'mt-1 w-full rounded-lg border border-black/20 bg-page px-3 py-2';

export function FormView({ form }: { form: StorioForm }) {
  const { detail } = useFormsText();
  const [state, formAction, pending] = useActionState(submitForm.bind(null, form.code), initialState);
  const missing = new Set(state.missing ?? []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <CmsSection sectionKey="detail" title="Form page labels" page={LIST_PAGE}>
        <Link href="/forms" className="text-sm font-semibold text-brand">
          <CmsField path="backText" label="Back link">{detail.backText}</CmsField>
        </Link>

        <article className="mt-6 space-y-6">
          {form.header_image_data?.file_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.header_image_data.file_url} alt={form.header_image_data.alt_text ?? ''} className="w-full rounded-2xl object-cover" />
          )}
          <h1 className="text-4xl font-extrabold tracking-tight">{form.title}</h1>
          {form.description && <p className="opacity-80">{form.description}</p>}

          {state.status === 'success' ? (
            <p className="rounded-xl bg-brand/10 p-4 font-semibold text-brand">
              {state.message || <CmsField path="successText" label="Success text">{detail.successText}</CmsField>}
            </p>
          ) : (
            <form action={formAction} className="space-y-5 rounded-2xl border border-black/10 bg-surface p-6">
              {form.elements.map((element) => (
                <Field key={element.id} element={element} invalid={missing.has(element.id)} requiredText={detail.requiredText} selectPlaceholder={detail.selectPlaceholder} />
              ))}
              {state.status === 'error' && (
                <p className="text-sm text-red-600">
                  {missing.size > 0 ? (
                    <CmsField path="missingText" label="Missing fields text">{detail.missingText}</CmsField>
                  ) : (
                    <CmsField path="errorText" label="Error text">{detail.errorText}</CmsField>
                  )}
                </p>
              )}
              <button type="submit" disabled={pending} className="rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-60">
                {pending ? (
                  <CmsField path="sendingText" label="Sending text">{detail.sendingText}</CmsField>
                ) : (
                  form.settings?.submitButtonText || <CmsField path="submitText" label="Button">{detail.submitText}</CmsField>
                )}
              </button>
            </form>
          )}
        </article>
      </CmsSection>
    </main>
  );
}

/** One form element, by its type. Inputs are named by the element id (the answers' keys). */
function Field({
  element,
  invalid,
  requiredText,
  selectPlaceholder,
}: {
  element: StorioFormElement;
  invalid: boolean;
  requiredText: string;
  selectPlaceholder: string;
}) {
  const { id, type, label, placeholder, helpText, required, options = [] } = element;
  const defaultValue = typeof element.defaultValue === 'string' || typeof element.defaultValue === 'number' ? String(element.defaultValue) : undefined;

  if (type === 'hidden') return null;
  if (type === 'header_image') {
    return element.imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={element.imageUrl} alt={element.altText ?? ''} className="w-full rounded-xl object-cover" />
    ) : null;
  }

  const title = (
    <span className="block text-sm font-medium">
      {label}
      {required && (
        <span className="ml-1 text-xs text-red-600">
          <CmsField path="requiredText" label="Required mark">{requiredText}</CmsField>
        </span>
      )}
    </span>
  );
  const help = helpText ? <span className="mt-1 block text-xs opacity-60">{helpText}</span> : null;
  const border = invalid ? 'border-red-600' : '';

  if (type === 'radio' || (type === 'checkbox' && options.length > 0)) {
    return (
      <fieldset className={`rounded-lg ${invalid ? 'ring-1 ring-red-600' : ''}`}>
        <legend>{title}</legend>
        <div className={`mt-2 flex gap-4 ${element.layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}>
          {options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input type={type} name={id} value={option.value} />
              {option.label}
            </label>
          ))}
        </div>
        {help}
      </fieldset>
    );
  }

  if (type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name={id} value="true" />
        {title}
        {help}
      </label>
    );
  }

  return (
    <label className="block">
      {title}
      {type === 'textarea' ? (
        <textarea name={id} rows={element.rows ?? 4} placeholder={placeholder} defaultValue={defaultValue} className={`${field} ${border}`} />
      ) : type === 'select' ? (
        <select name={id} defaultValue={defaultValue ?? ''} className={`${field} ${border}`}>
          <option value="">{placeholder || selectPlaceholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : type === 'file' || type === 'image' ? (
        <input
          type="file"
          name={id}
          multiple={element.allowMultiple}
          accept={type === 'image' ? 'image/*' : element.acceptedTypes?.join(',')}
          className={`${field} ${border}`}
        />
      ) : (
        <input
          type={type === 'phone' ? 'tel' : ['email', 'password', 'number', 'date'].includes(type) ? type : 'text'}
          name={id}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`${field} ${border}`}
        />
      )}
      {help}
    </label>
  );
}
