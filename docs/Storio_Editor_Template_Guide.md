# Storio Editor Template Guide

How to build a Storio template that school administrators can edit visually from the Storio dashboard.

The starter kit uses no editor library. Everything the editor needs is already in this repository:

| Part | Where | What it does |
| :--- | :--- | :--- |
| The editor kit | `src/lib/storio-editor/` | `<CmsSection>`, `<CmsField>`, `<CmsIcon>`, `usePageContent`, `getPageMetadata` and the client of Storio's `/api/cms/`. A fixed protocol shared with the Storio dashboard and backend. **Never edit it.** |
| The wiring | `src/cms.config.ts`, `src/lib/cms-server-storage.ts`, `src/components/cms/` | Builds the editor config from the manifest, loads each school's saved content on the server, and adds the Theme settings pencils. |
| `@storio/template-sdk` | `packages/*.tgz` | Loads the school's own data: settings, notices, blogs, staff, events... See the [SDK V2 Guide](./Storio_SDK_V2_Endpoints_and_Methods_Guide.md). |

A page becomes editable only if it follows the structure in this guide. Anything you hard-code in JSX stays fixed, and the school cannot change it.

---

## 1. How editing works

1. The school administrator opens **Template Customization** in the Storio dashboard.
2. The dashboard shows your template in a live preview on the school's own domain. Hovering a text, image or icon shows a pencil.
3. The administrator clicks a pencil, edits the value (and its look in the **Style** tab), and clicks **Save draft** or **Publish**.
4. The edit is saved by the Storio backend for that school only. Your template reads it on the next request.

The dashboard builds its editor from `public/storio.template.json`:

- `"editor": "storio-elements"` turns the editor on (without it the dashboard shows the classic customizer);
- `"editorPages"` lists your editable pages, their sections and default content;
- `"editorIcons"` lists the icons an administrator may pick;
- `"customization"` and `"navigation"` become the editor's **Theme settings** (colours, header/footer texts, menu);
- `"features"` must include `"template_customization"`: a school gets only the dashboard modules listed there, and without it its admins have no **Templates** menu and cannot open the editor. Keep the other base modules too (`generalSettings`, `accounts`, `auth`, `mediaFile`; see the [Manifest Guide](./Storio_Template_Manifest_Guide.md)).

The dashboard reads the manifest of your **approved published version**. A change to the manifest (a page, section, field, icon or Theme settings field) shows in the dashboard only after you publish a new version and it is approved.

---

## 2. Project structure

```
public/storio.template.json         the manifest (id, editor pages, icons, Theme settings)
scripts/storio-editor-sync.mjs      copies src/content/*.json into the manifest and checks every rule
scripts/storio-template-id.mjs      sets the template id everywhere (npm run template:id)
src/
  content/<page key>.json           default content of each page (what a new school sees)
  cms.config.ts                     the editor config, built from the manifest
  lib/storio-editor/                the editor kit (never edit)
  lib/cms-icons.generated.ts        icons from "editorIcons" (generated, never edit)
  lib/cms-server-storage.ts         reads the request school's saved content on the server
  lib/theme.ts                      Theme settings values (customization + navigation)
  lib/site.ts                       the school's settings (name, logo, contact) with the SDK
  lib/tenant.ts                     resolveTenant(): Standalone Preview or tenant
  lib/data.ts                       withDemoFallback(): Rule 1
  lib/seo.ts                        pageMetadata(), siteMetadata()
  components/cms/                   providers, use<Page>Text helpers, ThemeField, ThemeColors
  app/(site)/<route>/page.tsx       server page: metadata + school data
  components/views/<Name>View.tsx   client view: renders content with <CmsSection>/<CmsField>
  components/site/                  Navbar and Footer
```

---

## 3. Set your template id first

Every page key starts with the template id (`template-0-starter-home`), and so do the content file names. The kit ships with the placeholder id `template-0-starter`. Set yours once, before you build pages:

```bash
npm run template:id -- template-9-sunrise
```

It changes the id in the manifest, renames the content files and updates every page key in `src/`. The id must follow Storio's format `template-<number>-<name>`. `npm run build` warns while the id is still the placeholder.

In the rest of this guide, `<id>` means your template id.

---

## 4. Add an editable page

Example: a `/facilities` page.

**Step 1. Write the default content** in `src/content/<id>-facilities.json`. Each top-level key is one section:

```json
{
  "intro": {
    "title": "Our facilities",
    "text": "Modern labs, a library and sports grounds.",
    "image": "/images/facilities.jpg",
    "imageAlt": "Our library"
  },
  "items": {
    "title": "What we offer",
    "list": [
      { "id": "f1", "icon": "BookOpen", "title": "Library", "text": "Over 10,000 books." }
    ]
  },
  "seo": { "title": "Facilities", "description": "", "keywords": [], "ogImage": "" }
}
```

**Step 2. List the page in the manifest.** In `public/storio.template.json`, add to `"editorPages"`:

```json
{
  "key": "<id>-facilities",
  "title": "Facilities",
  "route": "/facilities",
  "sections": [
    { "key": "intro", "label": "Intro" },
    { "key": "items", "label": "Facilities" },
    { "key": "seo", "label": "SEO" }
  ]
}
```

The sections are exactly the keys of the JSON file, in page order. Add every new icon name (here `"BookOpen"`) to `"editorIcons"`. Then run:

```bash
npm run editor:sync
```

It copies the JSON into the manifest (`defaults`), regenerates `src/lib/cms-icons.generated.ts` and checks every rule the Storio backend enforces. Fix every problem it reports.

**Step 3. Create the page's text helper** `src/components/cms/useFacilitiesText.ts`. Copy `useAboutText.ts` and change the names and the page key. It fills each section from the defaults first, so a field you add later never shows up empty for a school that already saved that section.

**Step 4. Write the client view** in `src/components/views/FacilitiesView.tsx`:

```tsx
'use client';

import { CmsField, CmsIcon, CmsSection } from '@/lib/storio-editor/site';
import { useFacilitiesText } from '@/components/cms/useFacilitiesText';

const PAGE = '<id>-facilities';

export function FacilitiesView() {
  const { intro, items } = useFacilitiesText();
  return (
    <main>
      <CmsSection sectionKey="intro" title="Intro" page={PAGE}>
        <h1><CmsField path="title" label="Title">{intro.title}</CmsField></h1>
        <p><CmsField path="text" label="Text">{intro.text}</CmsField></p>
        <CmsField path="image" label="Image">
          <img src={intro.image} alt={intro.imageAlt} />
        </CmsField>
      </CmsSection>
      <CmsSection sectionKey="items" title="Facilities" page={PAGE}>
        <h2><CmsField path="title" label="Title">{items.title}</CmsField></h2>
        {items.list.map((item, i) => (
          <div key={item.id}>
            <CmsField path={`list.${i}.icon`} label="Icon"><CmsIcon name={item.icon} className="h-6 w-6" /></CmsField>
            <h3><CmsField path={`list.${i}.title`} label="Title">{item.title}</CmsField></h3>
            <p><CmsField path={`list.${i}.text`} label="Text">{item.text}</CmsField></p>
          </div>
        ))}
      </CmsSection>
    </main>
  );
}
```

**Step 5. Write the server page** in `src/app/(site)/facilities/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { FacilitiesView } from '@/components/views/FacilitiesView';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('<id>-facilities');
}

export default function FacilitiesPage() {
  return <FacilitiesView />;
}
```

**Step 6.** Run `npm run editor:check`, `npm run typecheck` and `npm run build`. Then test it in Storio (section 9).

---

## 5. Naming rules (Storio refuses anything else)

- **Page key:** `<id>-<name>`, lowercase letters, digits and `-`. Record pages: `<id>-<name>-detail`.
- **Section key:** letters, digits, `_` or `-`, starting with a letter, unique within the page. `seo` is the page's SEO section. Never use `navigation` or the name of a `customization` group (`colors`, `content`...) as a section key, and never add `"global": true` to a page: either one stops every Theme settings pencil from working. `npm run editor:sync` refuses both.
- **Field names decide which control the editor shows** (camelCase):
  - text: `title`, `subtitle`, `text`, `buttonText`, `badge`... A text field must not start or end with `icon`, must not end with `color`/`colour`/`font`, and must not contain `image`, `img`, `logo`, `photo`, `avatar`, `banner`, `cover`, `thumbnail`, `picture`, `src` or `favicon` unless it ends with `Alt`, `Label`, `Title`, `Text` or `Description` (`imageAlt` is a text).
  - image (picker and upload): ends with `image`/`Image` (`image`, `heroImage`), or `logo`/`photo`.
  - icon (picker): ends with `icon`/`Icon`. Its value is a lucide icon name listed in `editorIcons`.
  - repeated items: an array of objects under a plural name (`items`, `list`, `steps`).

---

## 6. Rules for editable markup

1. **One `<CmsSection>` per section**, always with `page="<page key>"`. Its `sectionKey` must be a key of the page's JSON and of its `editorPages` entry.
2. **A `<CmsField>` around every visible static value**: titles, paragraphs, button labels, images and icons. `path` is the value's position inside the section: `title`, or `` `list.${i}.title` `` inside `.map()`.
3. **Put `<CmsField>` inside `<li>`, `<td>`, `<a>` and `<button>`, never around them.** The element and its classes stay yours.
4. **Attributes** (`alt`, `placeholder`, `aria-label`) are fields too (`imageAlt`, `searchPlaceholder`), used in the attribute without a `<CmsField>`; the section's form edits them.
5. **Text with inline markup** becomes one field per text run: `Welcome to <span class="text-brand">Our School</span>` → fields `titleStart` and `titleHighlight`. Never put HTML in a content value.
6. **`next/image`:** uploads come back as absolute URLs on the school's domain. Add `unoptimized={src.startsWith('http') || src.startsWith('/media/')}`.
7. **Never move into page content:** the school's data (SDK), Theme settings values, hrefs, class names, dates or anything computed in code.
8. **Do not edit `src/content/*.json` to change one school's site.** Those are the defaults for every school.
9. **Field styles** (the Style tab: font, colour, size, spacing, background, corners, aspect ratio...) are saved and applied by `<CmsField>` automatically. No code needed.

---

## 7. Header, footer and Theme settings

Storio has no site-wide page in the editor. What appears on every page comes from three places:

| What | From | Editable where |
| :--- | :--- | :--- |
| School name, logo, contact details, social links | the school's settings (`loadSettings()` in `src/lib/site.ts`, SDK) | the dashboard's settings pages (no pencil) |
| Header menu | Theme settings > Navigation (`navigation.navbarLinks` in the manifest) | the editor's Theme settings |
| Colours | Theme settings > Colors (`customization.colors`) | the editor's Theme settings |
| Header and footer texts | Theme settings > Content (`customization.content`), shown with `<ThemeField>` | a pencil on every page |

**Theme settings texts.** Add a field to `customization.content` in the manifest (`{ "id": "footer_tagline", "label": "Footer tagline", "type": "text", "default": "..." }`), then show it with a pencil:

```tsx
<ThemeField field="footer_tagline" label="Footer tagline">{themeText(theme, 'footer_tagline')}</ThemeField>
```

`theme` comes from `loadTheme()` (`src/lib/theme.ts`): the school's saved value, or the manifest default. In the editor, the text follows the typing live. Add `section="<group>"` for a field outside the `content` group.

**Colours.** Each field of `customization.colors` becomes a CSS variable: `primaryColor` → `--primary-color` (`<ThemeColors>` in `src/app/(site)/layout.tsx`, live in the editor preview). `src/app/globals.css` maps them to Tailwind colours:

| Tailwind class | Variable |
| :--- | :--- |
| `bg-brand`, `text-brand` | `--primary-color` |
| `bg-accent`, `text-accent` | `--accent-color` |
| `text-ink`, `bg-ink` | `--text-color` |
| `bg-page` | `--background-color` |
| `bg-surface` | `--surface-color` |

Use these classes instead of fixed colours (`bg-green-700`), or Theme settings will have no effect. To add a colour: add the field to `customization.colors`, a fallback in `:root` in `globals.css` (same value as its `default`), and map it in `@theme inline`.

**SEO.** The title template and default description come from the school's settings (`siteMetadata()`); each page adds its own from its `seo` section (`pageMetadata()`).

---

## 8. Records (notices, blogs, events)

Notices, blogs and events are the school's own records, loaded with the SDK. They are not page content.

- Load them on the server with the SDK and apply Rule 1 with `withDemoFallback` (see `src/lib/notices.ts`).
- Fixed text of the page (headings, labels, "Read more") is page content.
- The editor can change these record fields, which saves the record itself (the same one the dashboard's Notices/Blogs/Events pages edit):

| collection | record id | editable fields |
| :--- | :--- | :--- |
| `notice` | the notice's id | `title` |
| `blog` | the post's slug | `title`, `excerpt` |
| `event` | the event's slug | `title`, `excerpt`, `location` |

  ```tsx
  <CmsField collection="notice" item={String(notice.id)} path="title">{notice.title}</CmsField>
  ```

- A detail page (`/notices/[id]`) is listed in `editorPages` with `"collection": "notice"` and `"parent": "<id>-notices"` (its list page). It may have sections for its fixed labels. It uses `useCollectionItem` so the unsaved title shows in the preview (see `NoticeDetailView.tsx`), and builds its metadata from the record.
- Never wrap record bodies (rich text), dates, images or slugs.

---

## 9. Test locally

```bash
npm run dev
```

Open `http://localhost:3000`: the site with its default content and demo records (Standalone Preview). `storio link` + `storio dev` shows it with a real school's data.

The editor itself lives in the Storio dashboard, not in this repository. To test pencils, live preview and saving, run the template behind a local Storio (storio-cms):

1. Increase `"version"` in the manifest, run `storio publish --local`, and approve it in the local SaaS admin.
2. Run the template as a **production build** on the port the local Storio gateway uses for it (`npm run build` then `npm start -- -p <port>`), with `NEXT_PUBLIC_API_URL` and `BACKEND_INTERNAL_URL` set to `http://localhost:8000` and `NEXT_PUBLIC_STORIO_TENANT_HOST` set to the test school's host. A dev server does not hydrate behind the gateway, so it shows no pencils.
3. Make the template the test school's live design and open `http://<school>.localhost:3000/dashboard/settings/template-customization`.
4. Check that every static text, image and icon shows a pencil; typing changes the preview live; Publish changes the live site; the Style tab works; Theme settings colours and texts follow live.

---

## 10. Platform rules

**Rule 1: Demo data vs. school data.** Use `resolveTenant()` and `withDemoFallback()` for every SDK call. Demo data may appear only in Standalone Preview (localhost, no linked tenant). For a real school, show only its own records, or an empty state.

**Rule 2: Strict typing.** Type SDK data with the SDK interfaces (`StorioNotice`...), and page content with the `use<Page>Text` helper's type. Do not use `any`.

**Rule 3: Editable by default.** Every visible static text, image and icon on a public page must be editable (sections 4 to 8).

**Rule 4: Keep the manifest in sync.** Run `npm run editor:sync` after every change to `src/content/*.json`, `editorPages` or `editorIcons`. `npm run build` runs the check and fails when they differ.

**Rule 5: Never edit the editor kit** (`src/lib/storio-editor/`) or `src/lib/cms-icons.generated.ts`. Do not add an admin page, an `/api/cms` route, a login or file storage: Storio provides all of that.
