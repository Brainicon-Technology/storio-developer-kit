import type { Metadata } from 'next';

import { HomeView } from '@/components/views/HomeView';
import { loadFaqs } from '@/lib/faqs';
import { loadHeroSlides, loadImportantLinks, loadTestimonials } from '@/lib/home';
import { loadNotices } from '@/lib/notices';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

/**
 * Pattern for every editable page:
 * - this server file: metadata from the page's "seo" section + tenant records (SDK),
 * - a client View (src/components/views) that renders the content with <CmsSection>/<CmsField>.
 * Page content itself is already loaded by <CmsProviders> in the root layout.
 * Independent SDK calls run in parallel with Promise.all.
 */
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-home');
}

export default async function HomePage() {
  const ctx = await resolveTenant();
  const [slides, notices, testimonials, faqs, links] = await Promise.all([
    loadHeroSlides(ctx),
    loadNotices(ctx),
    loadTestimonials(ctx),
    loadFaqs(ctx),
    loadImportantLinks(ctx),
  ]);

  return (
    <HomeView
      slides={slides}
      notices={notices.slice(0, 3)}
      testimonials={testimonials.slice(0, 3)}
      faqs={faqs.slice(0, 3)}
      links={links}
    />
  );
}
