import type { Metadata } from 'next';

import { NoticesView } from '@/components/views/NoticesView';
import { pageMetadata } from '@/lib/seo';
import { searchNotices } from '@/lib/notices';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-notices');
}

/** /notices?q=exam searches with storio.apiFetch; without ?q= it lists every notice (getNotices). */
export default async function NoticesPage({ searchParams }: PageProps<'/notices'>) {
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q : '';
  const notices = await searchNotices(query, await resolveTenant());
  return <NoticesView notices={notices} query={query} />;
}
