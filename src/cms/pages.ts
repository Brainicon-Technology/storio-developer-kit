import type { CmsStyleOptions, CollectionLimit, PageDef } from '@brainicon/storio-elements-editor';

import site from '@/content/site.json';
import home from '@/content/home.json';
import about from '@/content/about.json';
import contact from '@/content/contact.json';
import notices from '@/content/notices.json';
import noticeDetail from '@/content/notice-detail.json';

/**
 * ============================================================================
 * Editable pages of this template (serializable part of the CMS config)
 * ============================================================================
 * This file must stay plain data: no React components, no functions. Why:
 * - Server code (metadata, the CMS API route) reads it directly.
 * - `npm run cms:manifest` copies it into public/storio.template.json under
 *   "editor", so the Storio tenant dashboard can build its editor screen for
 *   this template without running the template's code.
 *
 * Icons are listed by name (`iconNames`). src/cms/config.ts maps each name to
 * its lucide-react component for the browser.
 *
 * Every page here needs:
 * - a unique `key` (letters, digits, "_" or "-"),
 * - the public `route`,
 * - `defaults` from src/content/<page>.json,
 * - one `sections` entry per top-level key of that JSON.
 * ============================================================================
 */

/** A PageDef without its React parts (icon components, transform functions). */
export type SerializablePageDef = Omit<PageDef, 'icon' | 'sections'> & {
  sections: { key: string; label: string }[];
};

export const cmsPages: SerializablePageDef[] = [
  {
    key: 'site',
    title: 'Site settings',
    route: '/',
    global: true,
    defaults: site,
    sections: [
      { key: 'header', label: 'Header' },
      { key: 'footer', label: 'Footer' },
      { key: 'contact', label: 'Contact & social' },
      { key: 'siteSeo', label: 'SEO defaults' },
      { key: 'theme', label: 'Theme' },
    ],
  },
  {
    key: 'home',
    title: 'Home',
    route: '/',
    defaults: home,
    sections: [
      { key: 'hero', label: '1. Hero' },
      { key: 'features', label: '2. Features' },
      { key: 'notices', label: '3. Latest notices' },
      { key: 'faq', label: '4. FAQ' },
      { key: 'seo', label: 'SEO' },
    ],
  },
  {
    key: 'about',
    title: 'About',
    route: '/about',
    defaults: about,
    sections: [
      { key: 'intro', label: '1. Intro' },
      { key: 'values', label: '2. Values' },
      { key: 'seo', label: 'SEO' },
    ],
  },
  {
    key: 'contact',
    title: 'Contact',
    route: '/contact',
    defaults: contact,
    sections: [
      { key: 'intro', label: '1. Intro' },
      { key: 'form', label: '2. Form' },
      { key: 'seo', label: 'SEO' },
    ],
  },
  {
    key: 'notices',
    title: 'Notices',
    route: '/notices',
    defaults: notices,
    sections: [
      { key: 'intro', label: '1. Notice board' },
      { key: 'seo', label: 'SEO' },
    ],
  },
  {
    // One notice at a time. Record fields (title, content) are edited through the
    // "notices" collection; the fixed labels of the page are section content.
    key: 'notice-detail',
    title: 'Notice',
    route: '/notices/[id]',
    collection: 'notices',
    parent: 'notices',
    defaults: noticeDetail,
    sections: [{ key: 'labels', label: 'Labels' }],
  },
];

/** Icons an editor may pick. Each name must exist in ICONS in src/cms/config.ts. */
export const iconNames = [
  'GraduationCap',
  'Users',
  'Trophy',
  'BookOpen',
  'Heart',
  'Lightbulb',
  'ShieldCheck',
  'Star',
  'Calendar',
  'Bell',
] as const;

export type IconName = (typeof iconNames)[number];

/** Presets of the Style tab. They point at the theme's CSS variables (see globals.css). */
export const cmsStyles: CmsStyleOptions = {
  colors: {
    Primary: 'var(--primary-color)',
    Accent: 'var(--accent-color)',
    Text: 'var(--text-color)',
    Background: 'var(--background-color)',
    Surface: 'var(--surface-color)',
  },
  fontSizes: { S: '0.875rem', M: '1rem', L: '1.5rem', XL: '2.25rem', XXL: '3rem' },
  spacing: { None: '0', Small: '0.5rem', Medium: '1rem', Large: '2rem' },
  radii: { None: '0', Small: '0.375rem', Medium: '0.75rem', Round: '9999px' },
};

/** Maximum items per list field. */
export const cmsCollectionLimits: Record<string, CollectionLimit> = {
  'home.features.items': { max: 6, label: 'Feature cards' },
  'about.values.items': { max: 6, label: 'Values' },
};
