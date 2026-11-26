import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { NoticeDetailView } from '@/components/views/NoticeDetailView';
import { loadNotice } from '@/lib/notices';
import { resolveTenant } from '@/lib/tenant';

/**
 * One notice (Storio record, collection "notice"). Its metadata is built from the record
 * itself (a page "seo" section would give every notice the same title).
 */
export async function generateMetadata({ params }: PageProps<'/notices/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const notice = await loadNotice(id, await resolveTenant());
  return notice ? { title: notice.title, description: notice.content?.slice(0, 160) } : {};
}

export default async function NoticeDetailPage({ params }: PageProps<'/notices/[id]'>) {
  const { id } = await params;
  const notice = await loadNotice(id, await resolveTenant());
  if (!notice) notFound(); // a real 404 (src/app/(site)/not-found.tsx)
  return <NoticeDetailView notice={notice} />;
}
