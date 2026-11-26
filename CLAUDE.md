# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is the starter kit that `npx @brainicon/create-storio-app` copies with degit from `main`. Every push to `main` ships to new template developers. The old starter kit (SDK only, no editor) is tagged `v1-legacy`.

It's a Next.js 16 app (App Router, React 19, Tailwind v4, TypeScript strict) for building themes ("templates") for Storio, a multi-tenant school CMS. School admins edit a template's content in the Storio dashboard's editor. No editor library is installed:

- `src/lib/storio-editor/` is the editor kit (25 files), copied byte for byte from Storio (same as `storio-cms/packages/template-sdk/STORIO_EDITOR_TEMPLATE_PROMPT.md`, Appendix A, and the little-flowers template). It is a fixed protocol with the Storio dashboard and backend: never edit it here; change it in Storio and copy it over. ESLint ignores it.
- `@storio/template-sdk` fetches the school's data. It's bundled as `packages/storio-template-sdk-1.1.0.tgz`. If the `.tgz` is replaced, update its `integrity` in `package-lock.json`, or `npm install` fails with EINTEGRITY.

## Commands

```bash
npm run dev            # Standalone Preview (demo data, default content)
npm run build          # prebuild runs template:id --check and editor:check
npm run lint
npm run typecheck      # tsc --noEmit (run `npx next typegen` first on a fresh clone: PageProps/LayoutProps)
npm run editor:sync    # copy src/content/*.json into the manifest's editorPages, regenerate src/lib/cms-icons.generated.ts
npm run editor:check   # the same checks without writing
npm run pages:check    # the code: every section/field/path editable, no static text in JSX, routes, SEO
npm run storio:check   # editor:check + pages:check + typecheck + lint (run before finishing any page work)
npm run template:id -- template-9-sunrise   # set the template id everywhere (keys, content file names)
```

**Creating or changing a page or section: always follow the `storio-page` skill** (`.claude/skills/storio-page/SKILL.md`), then run `npm run storio:check` until it is clean. Hooks in `.claude/settings.json` run `pages:check` after each edit and before finishing. The build also runs it.

There is no test runner. The editor UI is not in this repo: test pencils and saving behind a local storio-cms (docs/Storio_Editor_Template_Guide.md §9).

Storio CLI commands: `storio link` sets `NEXT_PUBLIC_STORIO_TENANT_HOST` in `.env.local`. `storio dev`, `storio unlink`, `storio validate` and `storio publish` do what their names say.

## Architecture

- **Modes** come from `resolveTenant()` in `src/lib/tenant.ts`. Standalone means localhost with no linked tenant. Everything else is a tenant. Never copy this logic into components.
- **Rule 1** (demo data only in Standalone) goes through `withDemoFallback` / `withDemoRecord` in `src/lib/data.ts`. **Rule 2:** no `any`.
- **Manifest is the source of truth** (`public/storio.template.json`): `"editor": "storio-elements"` turns the dashboard editor on; `editorPages` (keys `<template id>-<name>`, defaults copied from `src/content/<key>.json` by `scripts/storio-editor-sync.mjs`); `editorIcons`; `customization` + `navigation` = the editor's Theme settings. `src/cms.config.ts` builds the editor config from it. The Storio backend refuses saves for pages and sections not listed. Never add `"global": true` or a section named `navigation` or like a customization group: it breaks every Theme settings pencil (the sync script refuses both).
- **Storage:** `src/lib/cms-server-storage.ts` reads the school's published content from the Storio backend (`/api/cms/records`, `x-tenant-host` from `resolveTenant()`); `src/components/cms/CmsProviders.tsx` in the root layout loads every page server-side. In the browser the kit talks to `/api/cms` on the school's domain (Storio gateway). There is no `/api/cms` route, admin page or file storage in this repo.
- **Page pattern:** `src/app/(site)/<route>/page.tsx` (server: `pageMetadata('<key>')` from `src/lib/seo.ts`, SDK data) renders `src/components/views/<Name>View.tsx` (client: `use<Page>Text()` from `src/components/cms/`, `<CmsSection page=...>`, `<CmsField>` around every static value).
- **Goals of this kit** (judge every change by them): (1) teach the SDK: every method, its return type, how to type it; (2) every page editable with the dashboard editor. Sample pages use every SDK 1.1.0 method except `getCollection` / `getCollectionItem` (custom collections: planned) and `apiFetch` (escape hatch: every endpoint has a named method, documented only); each View starts with an "SDK data on this page" comment (method → return type → loader).
- **School data:** one loader per SDK method in `src/lib/<area>.ts`: `safely(storio.x())` → normalizer from `src/lib/normalize.ts` → `withDemoFallback`. The live API still differs from some SDK 1.1.0 types (hero slides, notices, blogs, staff, gallery, albums, activities, board notices: other field names; relative media paths everywhere; events, event categories and institution cards paginated; event detail by id only): normalizers map records to the SDK types, and only make media URLs absolute where the type already matches (testimonials, leadership, careers). List filters go in the first argument with the tenant host: `getBlogs({ category, tenantHost })`. Layout, customization and navigation are fetched with `next: { revalidate: 0 }`. Dashboard HTML goes through `<RichText>`. Forms are Server Actions that never call Storio in Standalone.
- **Empty data sections** are hidden for visitors but stay visible in the editor preview (`useInEditor()` / `<EmptyInEditor>` in `src/components/cms/EditorOnly.tsx`), so their pencils stay reachable.
- **No global page.** Header/footer: `loadLayout()` in `src/lib/site.ts` (one `getLayout` call; falls back to `getSettings` + `getCustomization` + `getNavigation`): school name, logo and contact (no pencil); header menu from Theme settings `navbarLinks`; footer quick links from the dashboard navigation; header/footer texts are `customization.content` fields shown with `<ThemeField>` (`themeText()` in `src/lib/theme.ts`).
- **Menus never 404:** `src/lib/routes.ts` maps menu links saved under another template (`LEGACY_ROUTES`, also redirects in `next.config.ts`) or drops them. A new page must be in `editorPages` or `OTHER_ROUTES`, or menu links to it are dropped.
- **Theme colours:** `customization.colors` → CSS variables via `<ThemeColors>` in `src/app/(site)/layout.tsx` (`primaryColor` → `--primary-color`, live in the editor preview). `globals.css` keeps matching fallbacks in `:root` and maps them to the Tailwind colours `brand`, `accent`, `ink`, `page` and `surface`.
- **Records:** `<CmsField collection="notice" item={id} path="title">`; blog and event records are keyed by **slug** (Storio allows notice `title`; blog `title`/`excerpt`; event `title`/`excerpt`/`location`). `/notices/[id]`, `/blogs/[slug]`, `/events/[id]` are editorPages entries with `collection` and `parent`. Other detail routes (`/activities/[slug]`, `/careers/[slug]`) can't be editor pages: their labels are a `detail` section of the list page.
- On Windows, `src/Components` and `src/components` are the same folder. Keep it lowercase in git.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
