import type { Metadata } from 'next';

import { FaqView } from '@/components/views/FaqView';
import { loadFaqs } from '@/lib/faqs';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-faq');
}

export default async function FaqPage() {
  const faqs = await loadFaqs(await resolveTenant());
  return <FaqView faqs={faqs} />;
}
