import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { PromotionBar } from '@/components/site/PromotionBar';
import { ThemeColors } from '@/components/cms/ThemeColors';
import { loadPromotions } from '@/lib/home';
import { loadSettings } from '@/lib/site';
import { loadTheme, themeColorFields } from '@/lib/theme';
import { resolveTenant } from '@/lib/tenant';

/**
 * Shell of every public page. The (site) folder is a route group: it is not part of the URL.
 * Loads the school's settings (SDK), Theme settings and promotions once for the header, footer and colours.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const ctx = await resolveTenant();
  const [settings, theme, promotions] = await Promise.all([loadSettings(ctx), loadTheme(ctx), loadPromotions(ctx)]);
  const colors = Object.fromEntries(themeColorFields().map((id) => [id, theme[id]]));

  return (
    <>
      <ThemeColors colors={colors} />
      <PromotionBar promotion={promotions[0]} />
      <Navbar settings={settings} theme={theme} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} theme={theme} />
    </>
  );
}
