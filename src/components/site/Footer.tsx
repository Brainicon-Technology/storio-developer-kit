import Link from 'next/link';
import type { StorioSettingsResponse } from '@storio/template-sdk';

import ThemeField from '@/components/cms/ThemeField';
import type { MenuLink } from '@/lib/site';
import { themeText, type ThemeValues } from '@/lib/theme';

/**
 * Site-wide footer (a Server Component).
 * - School name, contact details and social links: the school's settings (SDK), no pencil.
 * - Quick links: the dashboard's navigation menu (getLayout / getNavigation), no pencil.
 * - Tagline, quick links title and "All rights reserved": Theme settings texts with a <ThemeField> pencil.
 */
export function Footer({
  settings,
  theme,
  quickLinks,
}: {
  settings: StorioSettingsResponse | null;
  theme: ThemeValues;
  quickLinks: MenuLink[];
}) {
  const siteName = settings?.site_title ?? '';

  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <p className="text-lg font-bold text-white">{siteName}</p>
          <p className="text-sm">
            <ThemeField field="footer_tagline" label="Footer tagline">{themeText(theme, 'footer_tagline')}</ThemeField>
          </p>
        </div>
        <div className="space-y-1 text-sm">
          {settings?.contact_email && <p>{settings.contact_email}</p>}
          {settings?.phone_number && <p>{settings.phone_number}</p>}
          {settings?.mailing_address && <p>{settings.mailing_address}</p>}
        </div>
        {quickLinks.length > 0 && (
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">
              <ThemeField field="footer_links_title" label="Quick links title">{themeText(theme, 'footer_links_title')}</ThemeField>
            </p>
            <ul className="space-y-1">
              {quickLinks.map((link, i) => (
                <li key={link.id ?? `${link.url}-${i}`}>
                  {/^https?:\/\//.test(link.url) ? (
                    <a href={link.url} target={link.target || '_blank'} rel="noreferrer" className="hover:text-white">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.url} className="hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="space-y-1 text-sm">
          {(settings?.social_links ?? []).map((social, i) => (
            <li key={`${social.url}-${i}`}>
              <a href={social.url} target="_blank" rel="noreferrer" className="capitalize hover:text-white">
                {social.platform}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} {siteName}.{' '}
        <ThemeField field="footer_rights" label="Copyright text">{themeText(theme, 'footer_rights')}</ThemeField>
      </p>
    </footer>
  );
}
