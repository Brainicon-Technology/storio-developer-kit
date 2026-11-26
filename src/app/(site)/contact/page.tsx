import type { Metadata } from 'next';

import { ContactView } from '@/components/views/ContactView';
import { pageMetadata } from '@/lib/seo';
import { loadLayout } from '@/lib/site';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-contact');
}

export default async function ContactPage() {
  // The settings come with the layout data (one cached getLayout call per request).
  const { settings } = await loadLayout(await resolveTenant());
  return <ContactView settings={settings} />;
}
