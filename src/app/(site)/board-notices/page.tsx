import type { Metadata } from 'next';

import { BoardNoticesView } from '@/components/views/BoardNoticesView';
import { loadBoardNotices } from '@/lib/results';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-board-notices');
}

export default async function BoardNoticesPage() {
  const notices = await loadBoardNotices(await resolveTenant());
  return <BoardNoticesView notices={notices} />;
}
