import Link from 'next/link';
import type { StorioSettingsResponse } from '@storio/template-sdk';

import ThemeField from '@/components/cms/ThemeField';
import { themeNavLinks, themeText, type ThemeValues } from '@/lib/theme';

/**
 * Site-wide header (a Server Component). What edits what:
 * - school name and logo: the school's settings (SDK), edited on the dashboard's settings pages, no pencil;
 * - menu links: Theme settings > Navigation (navbarLinks in the manifest);
 * - button text: a Theme settings text with a <ThemeField> pencil, so it is editable on every page.
 * Header and footer never get a page of their own in the editor (no "global" page in Storio).
 */
export function Navbar({ settings, theme }: { settings: StorioSettingsResponse | null; theme: ThemeValues }) {
  const links = themeNavLinks(theme);
  const siteName = settings?.site_title ?? '';

  return (
    <header className="border-b border-black/10 bg-page">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand">
          {settings?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt="" className="h-8 w-auto" />
          )}
          {siteName}
        </Link>
        <ul className="flex flex-wrap items-center gap-6 text-sm">
          {links.map((link, i) => (
            <li key={link.id ?? `${link.href}-${i}`} className="group relative">
              <Link href={link.href} className="hover:text-brand">
                {link.name}
              </Link>
              {/* Sub-links (Theme settings > Navigation): shown on hover. */}
              {link.subLinks && link.subLinks.length > 0 && (
                <ul className="invisible absolute left-0 top-full z-20 min-w-48 rounded-lg border border-black/10 bg-page py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                  {link.subLinks.map((sub, j) => (
                    <li key={sub.id ?? `${sub.href}-${j}`}>
                      <Link href={sub.href} className="block px-4 py-2 hover:text-brand">
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li>
            <Link href="/admission" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white">
              <ThemeField field="header_cta_text" label="Header button">{themeText(theme, 'header_cta_text')}</ThemeField>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
