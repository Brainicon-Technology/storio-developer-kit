import type { Metadata } from 'next';

import { ContactView } from '@/components/views/ContactView';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('contact');
}

export default function ContactPage() {
  return <ContactView />;
}
