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
  lib/site.ts                       getLayout: settings, Theme settings and menu in one call
  lib/tenant.ts                     resolveTenant(): Standalone Preview or tenant
  lib/data.ts                       withDemoFallback(), withDemoRecord(), safely(): Rule 1
  lib/seo.ts                        pageMetadata(), siteMetadata()
  lib/<area>.ts                     one loader per SDK method (notices.ts, blogs.ts, academics.ts...)
  lib/normalize.ts                  maps live API records to the SDK types (see section 8.1)
  lib/types.ts                      types + guards for the SDK methods that return loose records
  lib/routes.ts                     this template's routes; keeps menus free of 404s
  data/defaultDemoData.ts           demo data for every SDK method (Standalone Preview only)
  components/cms/                   providers, use<Page>Text helpers, ThemeField, ThemeColors, EditorOnly
  app/(site)/<route>/page.tsx       server page: metadata + school data
  components/views/<Name>View.tsx   client view: renders content with <CmsSection>/<CmsField>
  components/site/                  Navbar, Footer, PromotionBar, RichText
```

### The sample pages

Every SDK method is used by at least one sample page. Each View starts with a comment listing its SDK methods, their return types and the loader that calls them, so you can see what a page reads before you read its markup.

| Route | Page key (`<id>-...`) | SDK methods |
| :--- | :--- | :--- |
| every page (layout) | (Theme settings) | `getLayout` (falls back to `getSettings`, `getCustomization`, `getNavigation`), `getPromotions` |
| `/` | `home` | `getHeroSlides`, `getNotices`, `getTestimonials`, `getFaqs`, `getImportantLinks` |
| `/about` | `about` | `getInstitutionProfile`, `getLeadershipMessages`, `getTeam` |
| `/contact` | `contact` | `getSettings`, `submitContactMessage` |
| `/notices`, `/notices/[id]` | `notices`, `notice-detail` | `getNotices`, `getNoticeDetail`, `apiFetch` (search) |
| `/blogs`, `/blogs/[slug]` | `blogs`, `blog-detail` | `getBlogs`, `getBlogDetail` |
| `/events`, `/events/[id]` | `events`, `event-detail` | `getEvents`, `getEventDetail` |
| `/activities`, `/activities/[slug]` | `activities` | `getActivities`, `getActivityDetail` |
| `/staff` | `staff` | `getStaff` |
| `/gallery` | `gallery` | `getGallery`, `getAlbums`, `getVideos` |
| `/faq` | `faq` | `getFaqs` |
| `/academics` | `academics` | `getAcademicPrograms`, `getClassRoutines`, `getSyllabuses`, `getStudentStats` |
| `/results` | `results` | `getExamResults` |
| `/calendar` | `calendar` | `getCalendarEvents` |
| `/careers`, `/careers/[slug]` | `careers` | `getCareers`, `getJobDetail` |
| `/board-notices` | `board-notices` | `getBoardNotices` |
| `/admission` | `admission` | `getAdmissionFormConfig`, `sendAdmissionOTP`, `verifyAdmissionOTP`, `submitAdmissionApplication` |
| `/citizen-charter` | `citizen-charter` | `getHotlines`, `getMpoInfo`, `getInformationService`, `getComplaintOfficer` |
| `/page/[slug]` | (none: all school data) | `getPageBySlug` |

Keep the pages your design needs, delete the rest (the route folder, its View, its `use<Page>Text` hook, its content file and its `editorPages` entry), and remove the matching modules from `features`.

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

**Step 6.** Run `npm run storio:check` (`editor:check`, `pages:check`, typecheck, lint) and `npm run build`. Then test it in Storio (section 9).

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

`npm run pages:check` enforces these rules on the code: every section has its `<CmsSection page={PAGE}>`, every `<CmsField path>` exists in the content JSON, record fields are the allowed ones, `<ThemeField>` fields exist in the manifest, and no word is written straight into the markup (text, `{'...'}`, `alt`, `placeholder`, `title`, `aria-label`). A line that must stay fixed (a brand name, for example) can opt out with a `{/* storio-check-ignore */}` comment on the line above.

---

## 7. Header, footer and Theme settings

Storio has no site-wide page in the editor. What appears on every page comes from three places:

| What | From | Editable where |
| :--- | :--- | :--- |
| School name, logo, contact details, social links | the school's settings (`loadLayout()` in `src/lib/site.ts`: one `getLayout` call per request) | the dashboard's settings pages (no pencil) |
| Favicon | the school's settings: `settings.favicon_url` (`""` when not set), used by `siteMetadata()` in `src/lib/seo.ts`; falls back to `public/favicon.ico` | the dashboard's settings pages (no pencil) |
| Header menu | Theme settings > Navigation (`navigation.navbarLinks` in the manifest) | the editor's Theme settings |
| Colours | Theme settings > Colors (`customization.colors`) | the editor's Theme settings |
| Header and footer texts | Theme settings > Content (`customization.content`), shown with `<ThemeField>` | a pencil on every page |

**Favicon.** Keep the template's own icon in `public/favicon.ico`, never as `src/app/favicon.ico`: Next.js puts a favicon file in `src/app/` ahead of metadata `icons`, so the school's favicon would never show.

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

**Menu links never 404.** A school keeps its menus when it switches templates, so its saved header menu and dashboard navigation may still point to the previous template's URLs (`/notice`, `/blog`...). `src/lib/routes.ts` maps each menu link to a page of this template (`LEGACY_ROUTES`) or leaves it out, and `next.config.ts` redirects those old URLs. When you add a page, list it in `editorPages` (or in `OTHER_ROUTES` in `routes.ts` if it is not an editor page), or menu links to it are dropped.

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
- **Detail pages of other data** (activities, jobs): the editor allows a `[slug]`/`[id]` editor page only for `notice`, `blog` and `event`. Such a route is not in `editorPages`; its fixed labels live in a `detail` section of its list page (`<CmsSection page="<id>-activities" sectionKey="detail">`), which admins edit from that list page. See `ActivityDetailView.tsx`.

---

## 8.1 School data on a page (the SDK)

Every other piece of school data follows one pattern. Copy it from any sample page.

1. **A loader in `src/lib/<area>.ts`** calls one SDK method and applies Rule 1:
   ```ts
   export async function loadStaff(ctx: TenantContext): Promise<StorioStaffMember[]> {
     const real = normalizeStaff(await safely(storio.getStaff(ctx.tenantHost)));
     return withDemoFallback(real, DEFAULT_DEMO_DATA.staff, ctx.isStandalone);
   }
   ```
   - `safely()` turns a network or server error into "no data", so a failing endpoint never breaks the page.
   - `withDemoFallback()` / `withDemoRecord()` show demo data in Standalone Preview only; a real school gets its own data or an empty state.
   - Add demo data for the method in `src/data/defaultDemoData.ts`.
2. **The server page** calls the loaders (in parallel with `Promise.all`) and passes the results to its View as props.
3. **The View** shows the data as is: school data is edited on the dashboard, so it gets no `<CmsField>`. Only the texts around it (headings, labels, empty texts) are page content.
4. **Empty data:** on the site, a section with no data is hidden, or shows its editable empty text. Inside the editor it must stay visible, or the admin cannot reach its pencils: use `useInEditor()` and `<EmptyInEditor>` from `src/components/cms/EditorOnly.tsx` (pattern in that file, used in `HomeView`, `AboutView`...).
5. **HTML from the dashboard** (blog bodies, job descriptions, custom pages) goes through `<RichText>` (`src/components/site/RichText.tsx`), which removes scripts and event handlers. Never use `dangerouslySetInnerHTML` directly.
6. **Forms that send data** (contact, admission) are Server Actions (`actions.ts` next to the page). They validate on the server and, in Standalone Preview, never contact Storio.

**Live API vs. SDK types.** The live Storio API does not always match the SDK's TypeScript types (as of SDK 1.0.1): some fields have other names (a hero slide's `heading` instead of `title`, a testimonial's `message` instead of `content`), images are media objects with relative paths (`/media/uploads/x.webp`), events come paginated (`{ count, results }`), and an event's detail is found by id only. `src/lib/normalize.ts` maps each record to the SDK type before Rule 1, so Views only see the documented types. When you use a new method, check its real response (`storio link`, then look at the data) and add a normalizer if it differs. Four methods return loose records in the SDK (`getTestimonials`, `getLeadershipMessages`, `getCareers`, `getJobDetail`): `src/lib/types.ts` types them and narrows each record with a guard (Rule 2).

---

## 9. Test

### 9.1 Always: checks and the site itself

```bash
npm run dev            # http://localhost:3000: default content + demo records (Standalone Preview)
npm run storio:check   # manifest, content files, icons, page code (pages:check), typecheck, lint
npm run build          # also runs the checks above
```

- Every page looks right with its default content.
- `storio link` + `storio dev`: the same with a real school's data (no demo data, empty states where the school has nothing).

The visual editor (pencils, live preview, saving) lives in the Storio dashboard, not in this repository. It shows your template once a version is **published and approved**.

### 9.2 Storio team: the editor on a local Storio

With storio-cms running locally (backend on `:8000`, dashboard on `:3000`):

1. **Sign in and link** to a local test school (this writes the local backend and the school to `.env.local`):

   ```bash
   storio login --local
   storio link --local
   ```

2. **Publish:** increase `"version"` in the manifest, run `storio publish --local`, and approve the submission in the local SaaS admin. Repeat this after every manifest change.
3. **Tell the gateway where the template runs:** in storio-cms `frontend-next/.env.local`, add `TEMPLATE_<ID>_INTERNAL_URL=http://localhost:<port>`, with your template id in capitals and `_` (for `template-9-sunrise`: `TEMPLATE_TEMPLATE_9_SUNRISE_INTERNAL_URL=http://localhost:3009`). Restart the dashboard.
4. **Run the template as a production build** on that port (a dev server does not hydrate behind the gateway, so it shows no pencils):

   ```bash
   npm run build
   npm start -- -p 3009
   ```

5. **Make it the school's live design** (dashboard > Settings > Templates), then open `http://<school>.localhost:3000/dashboard/settings/template-customization`.
6. **Check:**
   - the Storio editor opens (not the classic customizer), with your pages first and "Theme settings" last;
   - every static text, image and icon shows a pencil, and typing changes the preview live;
   - **Save draft** keeps the live site unchanged; **Publish** changes it; **Reset** brings back the default;
   - the Style tab works for texts, images and icons;
   - Theme settings: colours and header/footer texts follow live, the menu changes after publish;
   - a notice title changed on its detail page also changes on the dashboard's Notices page.

If the classic customizer opens instead: check that the new version is published **and** approved, that `features` contains `template_customization`, and that the school's live design uses this template.

### 9.3 Common problems

| Problem | Cause and fix |
| :--- | :--- |
| `npm run build` fails with `"defaults" differ from ...` | A content file changed without sync. Run `npm run editor:sync`. |
| `editor:sync` says a key `is not in "sections"` | The content file has a top-level key that the page's `editorPages` entry does not list (or the reverse). Make them match. |
| A text has no pencil | It is not inside a `<CmsField>`, or its `<CmsSection>` has no `page=`, or the section is missing from `editorPages`. |
| A field shows an image or icon picker instead of a text box | Its name looks like an image or icon field. Rename it (section 5). |
| An icon picker is empty, or a picked icon does not show | The icon name is not in `editorIcons`. Add it and run `npm run editor:sync`. |
| A new field is empty for a school | Read the page through its `use<Page>Text` helper (it fills new fields from the defaults), not `usePageContent` directly. |
| Theme settings colours change nothing | The design uses fixed colours (`bg-green-700`). Use `bg-brand`, `text-accent`... |
| A dashboard change does not show | The dashboard uses your last **approved** version. Increase `version`, publish, approve. |
| Admins have no Templates menu | `features` is missing `template_customization`. |

---

## 10. Platform rules

**Rule 1: Demo data vs. school data.** Use `resolveTenant()` and `withDemoFallback()` for every SDK call. Demo data may appear only in Standalone Preview (localhost, no linked tenant). For a real school, show only its own records, or an empty state.

**Rule 2: Strict typing.** Type SDK data with the SDK interfaces (`StorioNotice`...), and page content with the `use<Page>Text` helper's type. Do not use `any`.

**Rule 3: Editable by default.** Every visible static text, image and icon on a public page must be editable (sections 4 to 8).

**Rule 4: Keep the manifest in sync.** Run `npm run editor:sync` after every change to `src/content/*.json`, `editorPages` or `editorIcons`. `npm run build` runs the check and fails when they differ.

**Rule 5: Never edit the editor kit** (`src/lib/storio-editor/`) or `src/lib/cms-icons.generated.ts`. Do not add an admin page, an `/api/cms` route, a login or file storage: Storio provides all of that.
