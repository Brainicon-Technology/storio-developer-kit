import SiteLayout from './(site)/layout';
import { NotFoundContent } from '@/components/site/NotFoundContent';

/** Shown for any URL that matches no page. Wrapped in the site layout so visitors keep the header and footer. */
export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}
