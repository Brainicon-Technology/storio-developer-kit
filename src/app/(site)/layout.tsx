import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { ThemeColors } from '@/components/cms/ThemeColors';
import { loadSettings } from '@/lib/site';
import { loadTheme, themeColorFields } from '@/lib/theme';
import { resolveTenant } from '@/lib/tenant';

/**
 * Shell of every public page. The (site) folder is a route group: it is not part of the URL.
 * Loads the school's settings (SDK) and Theme settings once for the header, footer and colours.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const ctx = await resolveTenant();
  const [settings, theme] = await Promise.all([loadSettings(ctx), loadTheme(ctx)]);
  const colors = Object.fromEntries(themeColorFields().map((id) => [id, theme[id]]));

  return (
    <>
      <ThemeColors colors={colors} />
      <Navbar settings={settings} theme={theme} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} theme={theme} />
    </>
  );
}
