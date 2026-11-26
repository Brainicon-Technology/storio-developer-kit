import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FormView } from '@/components/views/FormView';
import { loadForm } from '@/lib/forms';
import { resolveTenant } from '@/lib/tenant';

/** One form (getForm). Not an editor page; its labels come from the Online forms page's "detail" section. */
export async function generateMetadata({ params }: PageProps<'/forms/[code]'>): Promise<Metadata> {
  const { code } = await params;
  const form = await loadForm(code, await resolveTenant());
  if (!form) return {};
  return { title: form.title, description: form.description?.slice(0, 160) };
}

export default async function FormPage({ params }: PageProps<'/forms/[code]'>) {
  const { code } = await params;
  const form = await loadForm(code, await resolveTenant());
  if (!form) notFound(); // closed or unknown form: a real 404
  return <FormView form={form} />;
}
