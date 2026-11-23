import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';

/** Shell of every public page. The (site) folder is a route group: it is not part of the URL. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
