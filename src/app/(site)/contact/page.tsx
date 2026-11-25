import type { Metadata } from 'next';

import { ContactView } from '@/components/views/ContactView';
import { pageMetadata } from '@/lib/seo';
import { loadSettings } from '@/lib/site';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-contact');
}

export default async function ContactPage() {
  const settings = await loadSettings(await resolveTenant());
  return <ContactView settings={settings} />;
}
