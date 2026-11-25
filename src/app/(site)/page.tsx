import type { Metadata } from 'next';

import { HomeView } from '@/components/views/HomeView';
import { pageMetadata } from '@/lib/seo';
import { loadNotices } from '@/lib/notices';
import { resolveTenant } from '@/lib/tenant';

/**
 * Pattern for every editable page:
 * - this server file: metadata from the page's "seo" section + tenant records (SDK),
 * - a client View (src/components/views) that renders the content with <CmsSection>/<CmsField>.
 * Page content itself is already loaded by <CmsProviders> in the root layout.
 */
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-home');
}

export default async function HomePage() {
  const notices = await loadNotices(await resolveTenant());
  return <HomeView notices={notices.slice(0, 3)} />;
}
