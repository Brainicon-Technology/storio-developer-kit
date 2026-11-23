'use client';

import Link from 'next/link';
import { CmsField, CmsSection, useSiteContent } from '@brainicon/storio-elements-editor/site';

import type siteDefaults from '@/content/site.json';

type SiteContent = typeof siteDefaults;

/**
 * Site-wide header. Its content lives in the "header" section of the global
 * "site" page, so it is editable from every page in the studio.
 * Pattern: <CmsSection page="site"> around the block, <CmsField> around every value.
 */
export function Navbar() {
  const { header } = useSiteContent<SiteContent>();

  return (
    <CmsSection sectionKey="header" title="Header" page="site" buttonPlacement="fixed">
      <header className="border-b border-black/10 bg-page">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand">
            {header.logo && (
              <CmsField path="logo" label="Logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={header.logo} alt="" className="h-8 w-auto" />
              </CmsField>
            )}
            <CmsField path="logoText" label="Site name">{header.logoText}</CmsField>
          </Link>
          <ul className="flex flex-wrap items-center gap-6 text-sm">
            {header.links.map((link, i) => (
              <li key={`${link.href}-${i}`}>
                <Link href={link.href} className="hover:text-brand">
                  <CmsField path={`links.${i}.label`} label="Menu link">{link.label}</CmsField>
                </Link>
              </li>
            ))}
            <li>
              <Link href={header.ctaHref} className="rounded-lg bg-brand px-4 py-2 font-semibold text-white">
                <CmsField path="ctaLabel" label="Button">{header.ctaLabel}</CmsField>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </CmsSection>
  );
}
