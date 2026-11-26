import { NotFoundContent } from '@/components/site/NotFoundContent';

/** Shown when a page in (site) calls notFound(), e.g. a notice id that does not exist. The site layout wraps it. */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
