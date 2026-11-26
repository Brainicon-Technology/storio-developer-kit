---
name: storio-page
description: Use whenever you create, add, build, scaffold, redesign or change a page, route, screen, section or component of this Storio template (for example "make an About page", "add a facilities section", "add a gallery to the home page", "build the website", "make this text editable"). Makes every static text, image and icon editable in the Storio dashboard editor and keeps the manifest, content JSON and code in sync, so nothing breaks in the tenant admin panel.
---

# Storio page

Every page of this template must be editable by a school in the Storio dashboard editor. Follow this
recipe for every new page or section, and for any change to a page's markup. Never skip a step:
the Storio backend refuses saves for pages, sections and fields it does not know.

`npm run pages:check` and `npm run editor:check` verify the result. The build runs both, so a page
that breaks these rules cannot be published.

## 0. Before you start

- Read the template id: `"id"` in `public/storio.template.json` (for example `template-0-starter`).
  Below, `<id>` means that value. Never hardcode another id.
- Pick a page name in kebab-case (`facilities`) and a PascalCase name (`Facilities`).
- Decide the page type:

| Type | Example | Editor page? |
| :--- | :--- | :--- |
| A. Static / content page | `/facilities`, `/about` | yes |
| B. Page showing school data (SDK) | `/staff`, `/gallery` | yes |
| C. Record detail of notice, blog or event | `/notices/[id]`, `/blogs/[slug]`, `/events/[id]` | yes, with `collection` + `parent` |
| D. Any other `[slug]` / `[id]` page | `/activities/[slug]`, `/careers/[slug]` | **no**: its labels go in a `detail` section of its list page, and the route goes in `OTHER_ROUTES` in `src/lib/routes.ts` |

Copy from the sample pages (they pass every check): `AboutView.tsx` (static sections, lists, icons),
`StaffView.tsx` and `HomeView.tsx` (school data, empty states), `NoticesView.tsx` / `BlogsView.tsx`
(record fields), `NoticeDetailView.tsx` (type C), `ActivityDetailView.tsx` (type D), all in
`src/components/views/`.

For an existing page (adding a section), skip to step 1 and edit that page's files instead of
creating them.

## 1. Content JSON: `src/content/<id>-<name>.json`

Copy `src/content/<id>-about.json`. Rules:

- Each top-level key is one section (one object). Section keys are letters, digits, `_` or `-`,
  starting with a letter. **Never** `navigation`, `colors`, `content` or any other `customization`
  group name.
- Every page (types A and B) ends with a `seo` section: `{ "title", "description", "keywords": [], "ogImage": "" }`.
- **Field names choose the editor control:** text (`title`, `text`, `buttonText`), image (ends with
  `image`/`Image`, `logo`, `photo`), icon (ends with `icon`/`Icon`, a lucide name), list (a plural
  name holding objects, each with a unique `"id"`). A text field must not contain `image`, `logo`,
  `photo`, `icon`, `src`... unless it ends with `Alt`, `Label`, `Title`, `Text` or `Description`
  (`imageAlt` is a text). Full rules: section 5 of the guide.
- Every visible static word of the page is a value here: headings, paragraphs, button labels,
  empty texts ("No notices yet"), `alt` / `placeholder` / `aria-label` texts (`imageAlt`, `searchPlaceholder`).
- Never put school data (SDK), HTML, class names, dates or computed values in it. Hrefs may be
  fields (`primaryHref`) but are not wrapped in `<CmsField>`.

## 2. Manifest: `public/storio.template.json`

Add the page to `"editorPages"` (types A, B, C):

```json
{ "key": "<id>-<name>", "title": "<Title>", "route": "/<name>",
  "sections": [ { "key": "intro", "label": "Intro" }, { "key": "seo", "label": "SEO" } ] }
```

- `sections` are exactly the JSON's top-level keys, in page order, each with a human `label`.
- Type C also gets `"collection": "notice" | "blog" | "event"` and `"parent": "<id>-<list page>"`.
- Never add `"global": true`.
- Add every new icon name to `"editorIcons"`.
- Want it in the header menu? Add `{ "id": "...", "name": "<Title>", "href": "/<name>" }` to the
  `navbarLinks` default under `"navigation"`.

Then run `npm run editor:sync` and fix everything it reports.

## 3. Text hook: `src/components/cms/use<Name>Text.ts`

Copy `useAboutText.ts` and change the names and page key (one line on top of `usePageText`). It merges the school's saved values
over the defaults, typed from the JSON.

## 4. Client View: `src/components/views/<Name>View.tsx`

Copy the closest sample View. Rules (the checker enforces each one):

1. `'use client'`, a top comment **"SDK data on this page"** listing `storio.method() -> ReturnType` and
   its loader (or "none").
2. `const PAGE = '<id>-<name>';`
3. One `<CmsSection sectionKey="<section>" title="<Label>" page={PAGE}>` per section except `seo`.
4. **Every** static value inside a `<CmsField path="<field>" label="<Label>">{value}</CmsField>`:
   - lists: `path={`list.${i}.title`}` inside `.map((item, i) => ...)`, `key={item.id}`;
   - images: `<CmsField path="image"><img src={x.image} alt={x.imageAlt} /></CmsField>`;
   - icons: `<CmsField path="items.${i}.icon"><CmsIcon name={item.icon} /></CmsField>`;
   - put `<CmsField>` **inside** `<a>`, `<button>`, `<li>`, `<td>`, never around them.
5. **No literal words in JSX.** Not as text, not in `{'...'}`, not in `alt` / `placeholder` /
   `title` / `aria-label`. Read them from the hook. Symbols (`©`, `·`, `/`, `→`) are fine.
6. School data (props from the server) is shown as is, **without** `<CmsField>`. Exception: record
   fields Storio can save: `<CmsField collection="notice" item={String(n.id)} path="title">`
   (notice: `title`; blog by **slug**: `title`, `excerpt`; event by **slug**: `title`, `excerpt`,
   `location`).
7. A section that shows school data and can be empty: hide it for visitors, keep it in the editor:
   `{(items.length > 0 || inEditor) && (<CmsSection ...>... {items.length === 0 && <EmptyInEditor source="Staff" />}`
   with `const inEditor = useInEditor();` from `@/components/cms/EditorOnly`.
8. Colours only through theme classes (`bg-brand`, `text-accent`, `text-ink`, `bg-page`, `bg-surface`),
   never hex values, so Theme settings recolour the page.
9. HTML from the dashboard goes through `<RichText html={...} />`, never `dangerouslySetInnerHTML`.
10. No `any`. No import of demo data in components.

## 5. Server page: `src/app/(site)/<name>/page.tsx`

Copy `src/app/(site)/staff/page.tsx`:

- `generateMetadata()` returns `pageMetadata('<id>-<name>')` (the editable `seo` section). Type C
  builds metadata from the record instead.
- Load school data with loaders (`await resolveTenant()`, then `Promise.all`), pass it as props.
- Detail pages call `notFound()` when the record is missing.

## 6. School data (type B): a loader in `src/lib/<area>.ts`

Reuse the existing loader if there is one (search `src/lib` for the SDK method). Otherwise copy
`loadStaff()` in `src/lib/people.ts`: `safely(storio.method(ctx.tenantHost))`, then a normalizer from
`src/lib/normalize.ts` when the live API differs from the SDK type, then
`withDemoFallback(real, DEFAULT_DEMO_DATA.x, ctx.isStandalone)`. Add demo data in
`src/data/defaultDemoData.ts`. Demo data must never show on a real school.

- **Filters** go in the first argument with the tenant host: `storio.getBlogs({ category: id, tenantHost })`.
  Category tabs: copy `BlogsView.tsx` + `blogs/page.tsx` (`?category=<slug>`, `<CategoryTabs>`, an
  editable `allText`).
- **Paginated lists** (events, event categories, institution cards) come as `{ count, results }`:
  unwrap with `listOf()` from `src/lib/normalize.ts`.
- **Media paths** are relative: make them absolute with `mediaUrl()`.
- **A form the school built** (Dynamic Form Builder): reuse `/forms/[code]` (`FormView.tsx`), don't
  rebuild it.

## 7. Verify (required, do not finish before this passes)

```bash
npm run storio:check   # editor:check + pages:check + typecheck + lint
```

Fix every error and re-run until it is clean. `pages:check` notes ("no pencil on the page") are
fine only for `placeholder` / `aria-label` texts. Then open the page in `npm run dev` to check
it renders.

Tell the developer: the page key, its sections, whether it's in the header menu, and to test the
pencils in the Storio dashboard editor after `storio publish`.

## Type D: detail page that can't be an editor page

1. Add a `detail` section (its labels: `backText`, ...) to the **list page's** JSON and manifest entry.
2. In the detail View: `const LIST_PAGE = '<id>-<list>';` and
   `<CmsSection sectionKey="detail" title="<X> page labels" page={LIST_PAGE}>`.
3. Add the route (`'/<list>/[slug]'`) to `OTHER_ROUTES` in `src/lib/routes.ts`.
See `src/components/views/ActivityDetailView.tsx`.

More detail: `docs/Storio_Editor_Template_Guide.md` (section 4: add a page, 5: naming rules,
6: markup rules, 8: records, 8.1: school data).
