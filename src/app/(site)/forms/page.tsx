import type { Metadata } from 'next';

import { FormsView } from '@/components/views/FormsView';
import { loadForms } from '@/lib/forms';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-forms');
}

export default async function FormsPage() {
  const forms = await loadForms(await resolveTenant());
  return <FormsView forms={forms} />;
}
