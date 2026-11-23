import type { Metadata } from 'next';

import { AboutView } from '@/components/views/AboutView';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('about');
}

export default function AboutPage() {
  return <AboutView />;
}
