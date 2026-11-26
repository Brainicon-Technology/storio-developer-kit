import type { Metadata } from 'next';

import { AdmissionView } from '@/components/views/AdmissionView';
import { admissionFields, loadAdmissionFormConfig } from '@/lib/admission';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-admission');
}

/** The form fields come from the school's form builder; sending happens in ./actions.ts. */
export default async function AdmissionPage() {
  const config = await loadAdmissionFormConfig(await resolveTenant());
  return <AdmissionView fields={admissionFields(config)} />;
}
