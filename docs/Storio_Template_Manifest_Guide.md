# Storio Template Manifest Guide (`storio.template.json`)

Every Storio template has one manifest: `public/storio.template.json`. This guide explains every field in it.

**Short version:** the starter kit's manifest is already complete and valid. You only need to:

1. set your template id: `npm run template:id -- template-9-sunrise`,
2. set `name`,
3. adjust `features`, `customization` and `navigation` to your design,
4. add your pages to `editorPages` and run `npm run editor:sync` (see the [Editor Template Guide](./Storio_Editor_Template_Guide.md)),
5. increase `version` before every publish.

---

## 1. What the manifest is for

The manifest tells Storio what your template offers, so Storio can build the school's dashboard for it:

| Storio uses... | ...to |
| :--- | :--- |
| `id`, `name`, `version` | register and version your template |
| `features` | decide which dashboard modules (Notices, Blogs, Staff...) a school using your template gets |
| `editor`, `editorPages`, `editorIcons` | build the visual editor: your editable pages, their sections and default content, and the icons admins may pick |
| `customization`, `navigation` | build the editor's **Theme settings**: colours, site-wide texts and the menu |

Your template reads the manifest too: `src/cms.config.ts` builds the editor config from `editorPages`, and `src/lib/theme.ts` takes the Theme settings defaults from `customization` and `navigation`.

**When does a change reach the dashboard?** Storio reads the manifest of your **approved, published version**. After changing the manifest, increase `version`, run `storio publish`, and wait for approval. Until then the dashboard keeps showing the previous version.

---

## 2. Identity: `id`, `name`, `version`

```json
"id": "template-9-sunrise",
"name": "Sunrise",
"version": "1.0.0"
```

- **`id`**: your template's unique id, in the format `template-<number>-<name>` (lowercase letters, digits, `-` or `_`). `storio validate` and `storio publish` refuse anything else.
  - Every editor page key and every content file name starts with the id, so **never change it by hand**. Use `npm run template:id -- template-9-sunrise`: it updates the manifest, the content file names and the code.
  - The starter kit ships with the placeholder `template-0-starter`; `npm run build` warns until you change it.
- **`name`**: the template's display name.
- **`version`**: a semantic version (`1.0.0`, `1.0.1`...). Increase it before every publish.

---

## 3. `features`: the dashboard modules

The CMS modules your template supports.

> [!IMPORTANT]
> When a school selects your template, Storio turns on **only** the modules listed here: the dashboard hides every other menu and blocks its API. Always keep the base modules, or the school loses its own admin pages:
> - `template_customization`: the **Templates** menu and the editor. Without it, admins cannot open Template Customization.
> - `generalSettings`: school name, logo, contact details (the starter kit's header and footer show them).
> - `accounts` and `auth`: users and roles.
> - `mediaFile`: the media library.

The starter kit lists the base modules plus every module its sample pages use (it has a sample page for all of them). When you delete sample pages, remove their modules too, so admins are not shown managers for content that never appears on their site. Keep only the modules your pages show.

**All 30 modules:**

| Module | What it is |
| :--- | :--- |
| `notice` | Notices, circulars, urgent announcements, attachments |
| `blogs` | News, articles, blog posts, categories, tags |
| `gallery` | Photo albums and galleries |
| `faq` | Frequently asked questions |
| `heroSlide` | Homepage hero carousel slides |
| `reels` | Embedded video reels (YouTube, Vimeo, Facebook) |
| `activity` | Sports, clubs, co-curricular activities |
| `mediaFile` | Media library (**base module**) |
| `careers` | Job vacancies and applications |
| `testimonial` | Testimonials from parents, students, alumni |
| `contact` | Contact form inbox and office contact details |
| `staff` | Teachers and staff directory, departments |
| `team` | Governing body, committee, leadership profiles |
| `leadership_message` | Messages from the Principal, Chairman, Founder |
| `important_links` | Quick links to boards, ministries, resources |
| `socialLink` | Social media links |
| `institution_profile` | EIIN, registration codes, establishment year, recognitions |
| `accounts` | User accounts (**base module**) |
| `auth` | Login, roles and permissions (**base module**) |
| `generalSettings` | Site title, tagline, logo, favicon, contact details, SEO (**base module**) |
| `template_customization` | Templates menu and the visual editor (**base module**) |
| `formbuilder` | Custom forms (registrations, surveys, sign-ups) |
| `custom_pages` | Pages created by admins (`/page/<slug>`) |
| `promotions` | Popups and announcement banners |
| `admission` | Online admission portal |
| `exam_results` | Published exam results |
| `calendar_events` | Academic calendar, holidays, exam schedules |
| `events` | Campus events |
| `academics` | Class routines, syllabuses, student statistics |
| `compliance` | MPO information, information service desk, complaint officer, emergency hotlines |

---

## 4. `customization`: Theme settings

The school-wide settings an admin changes in the editor under **Theme settings**. Fields are grouped; each group becomes one section of Theme settings.

```json
"customization": {
  "colors": [
    { "id": "primaryColor", "label": "Primary Color", "type": "color", "default": "#0e704b" },
    { "id": "accentColor", "label": "Accent Color", "type": "color", "default": "#d97706" }
  ],
  "content": [
    { "id": "header_cta_text", "label": "Header button text", "type": "text", "default": "Apply Now" },
    { "id": "footer_tagline", "label": "Footer tagline", "type": "text", "default": "Empowering future leaders through excellence." }
  ]
}
```

- **Groups:** usually `colors`, `typography`, `layout` and `content`. The starter kit uses `colors` and `content`.
- **Field types:** `color` (colour picker), `text` (text input), `boolean` (toggle), `select` (dropdown; add `"options": [{ "label": "Classic", "value": "classic" }]`).
- **`id`** is the key your template reads; **`default`** is the value until the school changes it.

**What belongs here (and what doesn't):**

| Put in `customization` | Put in page content (`editorPages`) instead |
| :--- | :--- |
| Colours, fonts, corner radius: settings for the whole site | Texts, images and icons of one page (hero title, section headings...) |
| Texts shown on every page: header button, footer tagline, copyright | Anything that appears on one page only |

**How the starter kit uses it:**

- `colors` → CSS variables: `primaryColor` becomes `--primary-color` (`<ThemeColors>`), which `globals.css` maps to Tailwind classes (`bg-brand`...). The colours follow the pickers live in the editor preview.
- `content` → texts shown with a `<ThemeField>` pencil, so admins can click them on any page.
- Values are read on the server with `loadTheme()` (`src/lib/theme.ts`): the school's saved value, or the `default`.

Never name an editor page section like a group here (`colors`, `content`...): it breaks the Theme settings pencils. `npm run editor:sync` refuses it.

---

## 5. `navigation`: the menu

The default menu, which admins change in the editor under **Theme settings > Navigation**:

```json
"navigation": [
  {
    "id": "navbarLinks",
    "label": "Navigation Links",
    "type": "links",
    "default": [
      { "id": "1", "name": "Home", "href": "/" },
      {
        "id": "2",
        "name": "About Us",
        "href": "/about",
        "subLinks": [{ "id": "2-1", "name": "Our History", "href": "/about/history" }]
      }
    ]
  }
]
```

- Keep the id `navbarLinks`.
- `subLinks` makes a dropdown.
- The starter kit's header reads it with `themeNavLinks(theme)` (`src/lib/theme.ts`).

---

## 6. Editor fields: `editor`, `editorPages`, `editorIcons`

These turn on the visual editor and describe your editable pages.

```json
"editor": "storio-elements",
"editorPages": [
  {
    "key": "template-9-sunrise-home",
    "title": "Home",
    "route": "/",
    "sections": [
      { "key": "hero", "label": "Hero" },
      { "key": "seo", "label": "SEO" }
    ],
    "defaults": { "...": "copied from src/content/template-9-sunrise-home.json" }
  },
  {
    "key": "template-9-sunrise-notice-detail",
    "title": "Notice",
    "route": "/notices/[id]",
    "collection": "notice",
    "parent": "template-9-sunrise-notices",
    "sections": [{ "key": "labels", "label": "Labels" }]
  }
],
"editorIcons": ["GraduationCap", "Users", "BookOpen"]
```

| Field | Meaning |
| :--- | :--- |
| `editor` | `"storio-elements"` turns on the visual editor. Without it, the dashboard shows the classic customizer. |
| `editorPages[].key` | `<template id>-<name>`, lowercase letters, digits and `-`. Unique. |
| `editorPages[].title` | The page's name in the editor's page list. |
| `editorPages[].route` | The page's URL (`/`, `/about`, `/notices/[id]`). |
| `editorPages[].sections` | One entry per top-level key of the page's content file, in page order. `seo` is the page's SEO section. |
| `editorPages[].defaults` | The page's default content. **Never write it by hand**: `npm run editor:sync` copies it from `src/content/<key>.json`. |
| `editorPages[].collection` | Only for a `[id]`/`[slug]` page: the Storio records it shows (`notice`, `blog` or `event`). Required exactly when the route has brackets. |
| `editorPages[].parent` | Optional, with `collection`: the key of its list page. |
| `editorIcons` | lucide-react icon names admins may pick for icon fields. `npm run editor:sync` generates the matching imports. |

**Rules** (Storio refuses a manifest that breaks them; `npm run editor:sync` checks all of them):

- Never add `"global": true` to a page, and never name a section `navigation` or like a `customization` group.
- Section keys: letters, digits, `_` or `-`, starting with a letter, unique within the page.
- Every section must have content in the page's file, and every key of the file must be a section.

Run `npm run editor:sync` after every change to `src/content/*.json`, `editorPages` or `editorIcons`. `npm run build` runs the check and fails when they are out of sync.

---

## 7. Complete example

The starter kit's own `public/storio.template.json` is the complete, valid example. In short:

```json
{
  "id": "template-9-sunrise",
  "editor": "storio-elements",
  "name": "Sunrise",
  "version": "1.0.0",
  "customization": {
    "colors": [{ "id": "primaryColor", "label": "Primary Color", "type": "color", "default": "#0e704b" }],
    "content": [{ "id": "footer_tagline", "label": "Footer tagline", "type": "text", "default": "Learning for life." }]
  },
  "features": ["notice", "contact", "socialLink", "mediaFile", "generalSettings", "accounts", "auth", "template_customization"],
  "navigation": [
    { "id": "navbarLinks", "label": "Navigation Links", "type": "links", "default": [{ "id": "1", "name": "Home", "href": "/" }] }
  ],
  "editorPages": [
    {
      "key": "template-9-sunrise-home",
      "title": "Home",
      "route": "/",
      "sections": [{ "key": "hero", "label": "Hero" }],
      "defaults": { "hero": { "title": "Welcome" } }
    }
  ],
  "editorIcons": ["GraduationCap"]
}
```

---

## 8. Before you publish

```bash
npm run editor:check   # editor pages, icons and content in sync
storio validate        # id, name, version, SDK dependency, security scan, .storioignore
```

Then increase `version` and run `storio publish -m "What changed"`.
