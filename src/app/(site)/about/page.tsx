import type { Metadata } from 'next';

import { AboutView } from '@/components/views/AboutView';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-about');
}

export default function AboutPage() {
  return <AboutView />;
}
