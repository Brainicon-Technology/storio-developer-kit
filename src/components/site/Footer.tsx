import type { StorioSettingsResponse } from '@storio/template-sdk';

import ThemeField from '@/components/cms/ThemeField';
import { themeText, type ThemeValues } from '@/lib/theme';

/**
 * Site-wide footer (a Server Component).
 * - School name, contact details and social links: the school's settings (SDK), no pencil.
 * - Tagline and "All rights reserved": Theme settings texts with a <ThemeField> pencil.
 */
export function Footer({ settings, theme }: { settings: StorioSettingsResponse | null; theme: ThemeValues }) {
  const siteName = settings?.site_title ?? '';

  return (
    <footer className="mt-16 bg-ink text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
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
