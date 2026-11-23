# Storio Editor Template Guide

How to build a Storio template that school administrators can edit visually from the Storio dashboard.

Templates built from this starter kit use two libraries:

| Library | What it does |
| :--- | :--- |
| `@brainicon/storio-elements-editor` | Makes page text, images, icons, site-wide content (header, footer, SEO), theme colours and field styles editable. |
| `@storio/template-sdk` | Loads the school's database records: notices, blogs, staff, events and so on. See the [SDK V2 Guide](./Storio_SDK_V2_Endpoints_and_Methods_Guide.md). |

A page becomes editable only if it follows the structure in this guide. Anything you hard-code in JSX stays fixed, and the school cannot change it.

---

## 1. How editing works

1. The school administrator opens **Template Customization** in the Storio dashboard.
2. The dashboard shows your template in a live preview. Hovering any part of the page shows a pencil.
3. The administrator clicks a pencil, edits the value in a form, and clicks **Save & Publish**.
4. The edit is saved for that school only. Your template reads it on the next request.

The dashboard builds its editor from the `editor` block of `public/storio.template.json`, which `npm run cms:manifest` generates from `src/cms/pages.ts`.

---

## 2. Project structure

```
src/
  content/<page>.json         default content of each page (what a new school sees)
  cms/pages.ts                list of editable pages and sections (plain data only)
  cms/config.ts               full editor config: icons and adapter (browser only)
  app/(site)/<route>/page.tsx server page: metadata + database records
  components/views/<Name>View.tsx   client view: renders content with <CmsSection>/<CmsField>
  components/site/            site-wide parts (Navbar, Footer)
  lib/tenant.ts               resolveTenant(): Standalone Preview or tenant
  lib/data.ts                 withDemoFallback(): Rule 1
  lib/cms-storage.ts          where edits are read from
  lib/seo.ts                  pageMetadata(), siteMetadata()
```

---

## 3. Add an editable page

Example: a `/facilities` page.

**Step 1. Write the default content** in `src/content/facilities.json`. Each top-level key is one section:

```json
{
  "intro": { "title": "Our facilities", "text": "Modern labs, a library and sports grounds." },
  "items": {
    "title": "What we offer",
    "list": [
      { "id": "f1", "icon": "BookOpen", "title": "Library", "text": "Over 10,000 books." }
    ]
  },
  "seo": { "title": "Facilities", "description": "Facilities at our school.", "keywords": [], "ogImage": "" }
}
```

**Step 2. Register the page** in `src/cms/pages.ts`:

```ts
import facilities from '@/content/facilities.json';

{
  key: 'facilities',
  title: 'Facilities',
  route: '/facilities',
  defaults: facilities,
  sections: [
    { key: 'intro', label: '1. Intro' },
    { key: 'items', label: '2. Facilities' },
    { key: 'seo', label: 'SEO' },
  ],
},
```

**Step 3. Write the client view** in `src/components/views/FacilitiesView.tsx`:

```tsx
'use client';

import { CmsField, CmsIcon, CmsSection, usePageContent } from '@brainicon/storio-elements-editor/site';
import type facilitiesDefaults from '@/content/facilities.json';

type FacilitiesContent = typeof facilitiesDefaults;

export function FacilitiesView() {
  const { intro, items } = usePageContent<FacilitiesContent>('facilities');
  return (
    <main>
      <CmsSection sectionKey="intro" title="Intro">
        <h1><CmsField path="title" label="Title">{intro.title}</CmsField></h1>
        <p><CmsField path="text" label="Text">{intro.text}</CmsField></p>
      </CmsSection>
      <CmsSection sectionKey="items" title="Facilities">
        <h2><CmsField path="title" label="Title">{items.title}</CmsField></h2>
        {items.list.map((item, i) => (
          <div key={item.id}>
            <CmsField path={`list.${i}.icon`} label="Icon"><CmsIcon name={item.icon} /></CmsField>
            <h3><CmsField path={`list.${i}.title`} label="Title">{item.title}</CmsField></h3>
            <p><CmsField path={`list.${i}.text`} label="Text">{item.text}</CmsField></p>
          </div>
        ))}
      </CmsSection>
    </main>
  );
}
```

**Step 4. Write the server page** in `src/app/(site)/facilities/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { FacilitiesView } from '@/components/views/FacilitiesView';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('facilities');
}

export default function FacilitiesPage() {
  return <FacilitiesView />;
}
```

**Step 5.** Run `npm run cms:manifest`, then check the page in the local editor (section 8).

---

## 4. Rules for editable markup

1. **One `<CmsSection>` per section.** Its `sectionKey` must match a key in the page's JSON and in `pages.ts`.
2. **A `<CmsField>` around every visible value**: titles, paragraphs, button labels, images, logos and icons. `path` is the value's position inside the section, in dot form. Use the list position for arrays: `list.0.title`, or `` `list.${i}.title` `` inside `.map()`.
3. **Put `<CmsField>` inside `<li>`, `<td>` and `<a>`, never around them.**
4. **Use arrays for repeated cards**, so editors can add, remove and reorder items. Limit them with `cmsCollectionLimits` in `pages.ts`.
5. **Icons are stored by name.** Add every name to `iconNames` in `pages.ts` and to `ICONS` in `config.ts`, and draw them with `<CmsIcon name={...} />`.
6. **The form is built from the JSON values.** The editor picks the field type from the key and value: keys like `image` or `logo` get an image picker, `icon` an icon picker, a `#rrggbb` value or a key ending in `Color` a colour picker, `keywords` a tag input. Name keys accordingly.
7. **Do not edit `src/content/*.json` to change one school's site.** Those are the defaults for every school.
8. **Section keys are unique between a page and the site page.** Every page may have `seo`. The site page uses `siteSeo` for that reason.

---

## 5. Site-wide content and theme

The page with `global: true` (key `site`, content in `src/content/site.json`) holds what appears on every page:

| Section | Used by |
| :--- | :--- |
| `header` | `Navbar` (logo, menu links, button) |
| `footer` | `Footer` |
| `contact` | footer and contact page (email, phone, address, social links) |
| `siteSeo` | root layout metadata (title template, default description, share image, favicon) |
| `theme` | CSS variables, written by `<CmsThemeStyle />` |

- Read site content with `useSiteContent()`, and add `page="site"` to the `<CmsSection>`.
- To show a site value inside a page body, name its section: `<CmsField page="site" section="contact" path="phone">`.

**Theme colours.** Each key in `theme` becomes a CSS variable: `primaryColor` becomes `--primary-color`. `src/app/globals.css` maps them to Tailwind colours:

| Tailwind class | Variable |
| :--- | :--- |
| `bg-brand`, `text-brand` | `--primary-color` |
| `bg-accent`, `text-accent` | `--accent-color` |
| `text-ink`, `bg-ink` | `--text-color` |
| `bg-page` | `--background-color` |
| `bg-surface` | `--surface-color` |

Use these classes instead of fixed colours (`bg-green-700`), or the theme settings will have no effect. To add a theme setting, add the key to `theme` in `site.json`, add a fallback in `:root` in `globals.css`, and map it in `@theme inline`.

**Field styles.** Each field also has a **Style** tab (colour, size, spacing and so on, per screen size). Its presets come from `cmsStyles` in `pages.ts` and point at the theme variables.

---

## 6. Database records (collections)

Notices, blogs and other records come from the school's database through the SDK. They are not page content.

- Load records on the server with the SDK, and apply Rule 1 with `withDemoFallback` (see `src/lib/notices.ts`).
- Fixed text of the page (headings, labels, "Read more") is page content.
- A record's own fields get `<CmsField collection="notices" item={String(notice.id)} path="title">`.
- A detail page (`/notices/[id]`) has `collection` and `parent` in `pages.ts`, and uses `useCollectionItem` so unsaved edits show in the preview (see `NoticeDetailView.tsx`).
- A detail page builds its metadata from the record, not from an `seo` section.

---

## 7. Platform rules

**Rule 1: Demo data vs. tenant data.** Use `resolveTenant()` and `withDemoFallback()` for every SDK call. Demo data may appear only in Standalone Preview (localhost, no linked tenant). For a real school, show only its own records, or an empty state. Never copy the host-detection logic into components.

**Rule 2: Strict typing.** Type SDK data with the SDK interfaces (`StorioNotice` and so on), and page content with `typeof <page>.json`. Do not use `any`.

**Rule 3: Editable by default.** Every visible text, image and icon on a public page must be editable (sections 3 to 6). The exceptions are values the school cannot save back, such as computed dates.

**Rule 4: Keep the manifest in sync.** Run `npm run cms:manifest` after every change to `src/cms/pages.ts` or `src/content/*.json`, and before `storio validate` and `storio publish`.

---

## 8. Test locally

```bash
npm run dev
```

- Open `http://localhost:3000` to see the site with default content and demo records.
- Open `http://localhost:3000/admin/cms`, the local editor. It works only in Standalone Preview under `npm run dev`. Check that:
  - every value on every page shows its own pencil,
  - edits appear in the preview while typing, and on the public page after **Save & Publish**,
  - theme colours change the whole site.
- Local edits are saved in `.cms/` (ignored by git and never published). Delete that folder to start over.
- `storio link` + `storio dev` runs the template against a real school. There, `/admin/cms` returns 404 and the template is read-only: edits are made from the Storio dashboard.

### Environment variables

| Variable | Purpose |
| :--- | :--- |
| `NEXT_PUBLIC_STORIO_TENANT_HOST` | Linked tenant. Set by `storio link`. |
| `STORIO_CMS_API_URL` | Storio editor API for tenant content. Set by the Storio platform. |
| `NEXT_PUBLIC_STORIO_DASHBOARD_ORIGIN` | Dashboard origin allowed to show the template in its editor preview. Set by the Storio platform. |
