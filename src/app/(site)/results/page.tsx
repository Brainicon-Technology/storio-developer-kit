import type { Metadata } from 'next';

import { ResultsView } from '@/components/views/ResultsView';
import { loadExamResults } from '@/lib/results';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-results');
}

export default async function ResultsPage() {
  const results = await loadExamResults(await resolveTenant());
  return <ResultsView results={results} />;
}
