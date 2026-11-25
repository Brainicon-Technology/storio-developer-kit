# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is the starter kit that `npx @brainicon/create-storio-app` copies with degit from `main`. Every push to `main` ships to new template developers. The old starter kit (SDK only, no editor) is tagged `v1-legacy`.

It's a Next.js 16 app (App Router, React 19, Tailwind v4, TypeScript strict) for building themes ("templates") for Storio, a multi-tenant school CMS. School admins edit a template's content in the Storio dashboard's editor. No editor library is installed:

- `src/lib/storio-editor/` is the editor kit (25 files), copied byte for byte from Storio (same as `storio-cms/packages/template-sdk/STORIO_EDITOR_TEMPLATE_PROMPT.md`, Appendix A, and the little-flowers template). It is a fixed protocol with the Storio dashboard and backend: never edit it here; change it in Storio and copy it over. ESLint ignores it.
- `@storio/template-sdk` fetches the school's data. It's bundled as `packages/storio-template-sdk-1.0.1.tgz`. If the `.tgz` is replaced, update its `integrity` in `package-lock.json`, or `npm install` fails with EINTEGRITY.

## Commands

```bash
npm run dev            # Standalone Preview (demo data, default content)
npm run build          # prebuild runs template:id --check and editor:check
npm run lint
npm run typecheck      # tsc --noEmit (run `npx next typegen` first on a fresh clone: PageProps/LayoutProps)
npm run editor:sync    # copy src/content/*.json into the manifest's editorPages, regenerate src/lib/cms-icons.generated.ts
npm run editor:check   # the same checks without writing
npm run template:id -- template-9-sunrise   # set the template id everywhere (keys, content file names)
```

There is no test runner. The editor UI is not in this repo: test pencils and saving behind a local storio-cms (docs/Storio_Editor_Template_Guide.md §9).

Storio CLI commands: `storio link` sets `NEXT_PUBLIC_STORIO_TENANT_HOST` in `.env.local`. `storio dev`, `storio unlink`, `storio validate` and `storio publish` do what their names say.

## Architecture

- **Modes** come from `resolveTenant()` in `src/lib/tenant.ts`. Standalone means localhost with no linked tenant. Everything else is a tenant. Never copy this logic into components.
- **Rule 1** (demo data only in Standalone) goes through `withDemoFallback` / `withDemoRecord` in `src/lib/data.ts`. **Rule 2:** no `any`.
- **Manifest is the source of truth** (`public/storio.template.json`): `"editor": "storio-elements"` turns the dashboard editor on; `editorPages` (keys `<template id>-<name>`, defaults copied from `src/content/<key>.json` by `scripts/storio-editor-sync.mjs`); `editorIcons`; `customization` + `navigation` = the editor's Theme settings. `src/cms.config.ts` builds the editor config from it. The Storio backend refuses saves for pages and sections not listed. Never add `"global": true` or a section named `navigation` or like a customization group: it breaks every Theme settings pencil (the sync script refuses both).
- **Storage:** `src/lib/cms-server-storage.ts` reads the school's published content from the Storio backend (`/api/cms/records`, `x-tenant-host` from `resolveTenant()`); `src/components/cms/CmsProviders.tsx` in the root layout loads every page server-side. In the browser the kit talks to `/api/cms` on the school's domain (Storio gateway). There is no `/api/cms` route, admin page or file storage in this repo.
- **Page pattern:** `src/app/(site)/<route>/page.tsx` (server: `pageMetadata('<key>')` from `src/lib/seo.ts`, SDK data) renders `src/components/views/<Name>View.tsx` (client: `use<Page>Text()` from `src/components/cms/`, `<CmsSection page=...>`, `<CmsField>` around every static value).
- **No global page.** Header/footer: school name, logo and contact from the school's settings (`loadSettings()` in `src/lib/site.ts`, no pencil); menu from Theme settings `navbarLinks`; header/footer texts are `customization.content` fields shown with `<ThemeField>` (`loadTheme()` / `themeText()` in `src/lib/theme.ts`).
- **Theme colours:** `customization.colors` → CSS variables via `<ThemeColors>` in `src/app/(site)/layout.tsx` (`primaryColor` → `--primary-color`, live in the editor preview). `globals.css` keeps matching fallbacks in `:root` and maps them to the Tailwind colours `brand`, `accent`, `ink`, `page` and `surface`.
- **Records:** notices use `<CmsField collection="notice" item={id} path="title">` (Storio allows notice `title`; blog `title`/`excerpt`; event `title`/`excerpt`/`location`). `/notices/[id]` is an editorPages entry with `collection: "notice"` and `parent`.
- On Windows, `src/Components` and `src/components` are the same folder. Keep it lowercase in git.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
