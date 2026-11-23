'use client';

import { CmsField, CmsSection, useSiteContent } from '@brainicon/storio-elements-editor/site';

import type siteDefaults from '@/content/site.json';

type SiteContent = typeof siteDefaults;

/** Site-wide footer: "footer" and "contact" sections of the global "site" page. */
export function Footer() {
  const { header, footer, contact } = useSiteContent<SiteContent>();

  return (
    <CmsSection sectionKey="footer" title="Footer" page="site">
      <footer className="mt-16 bg-ink text-white/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-lg font-bold text-white">{header.logoText}</p>
            <p className="text-sm">
              <CmsField path="tagline" label="Tagline">{footer.tagline}</CmsField>
            </p>
          </div>
          <div className="space-y-1 text-sm">
            {/* Values of another section: name it with page + section. */}
            <p><CmsField page="site" section="contact" path="email" label="Email">{contact.email}</CmsField></p>
            <p><CmsField page="site" section="contact" path="phone" label="Phone">{contact.phone}</CmsField></p>
            <p><CmsField page="site" section="contact" path="address" label="Address">{contact.address}</CmsField></p>
          </div>
          <ul className="space-y-1 text-sm">
            {contact.socials.map((social, i) => (
              <li key={`${social.href}-${i}`}>
                <a href={social.href} target="_blank" rel="noreferrer" className="hover:text-white">
                  <CmsField page="site" section="contact" path={`socials.${i}.label`} label="Social link">
                    {social.label}
                  </CmsField>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs">
          <CmsField path="copyright" label="Copyright">{footer.copyright}</CmsField>
        </p>
      </footer>
    </CmsSection>
  );
}
