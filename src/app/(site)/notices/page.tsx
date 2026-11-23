import type { Metadata } from 'next';

import { NoticesView } from '@/components/views/NoticesView';
import { pageMetadata } from '@/lib/seo';
import { loadNotices } from '@/lib/notices';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('notices');
}

export default async function NoticesPage() {
  const notices = await loadNotices(await resolveTenant());
  return <NoticesView notices={notices} />;
}
