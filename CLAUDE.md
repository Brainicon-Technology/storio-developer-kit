# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is the starter kit that `npx @brainicon/create-storio-app` copies with degit from `main`. Every push to `main` ships to new template developers. The old starter kit (SDK only, no editor) is tagged `v1-legacy`.

It's a Next.js 16 app (App Router, React 19, Tailwind v4, TypeScript strict) for building themes ("templates") for Storio, a multi-tenant school CMS. It uses two libraries:

- `@brainicon/storio-elements-editor`: makes page content editable. Source lives in `D:\Brainicon Technology\Public-Site-CMS` (github.com/MostofaSeum/storio-elements-editor), installed from GitHub at a tag.
- `@storio/template-sdk`: fetches tenant DB records. It's bundled as `packages/storio-template-sdk-1.0.1.tgz`. If the `.tgz` is replaced, update its `integrity` in `package-lock.json`, or `npm install` fails with EINTEGRITY.

## Commands

```bash
npm run dev            # Standalone Preview; local editor at /admin/cms
npm run build
npm run lint
npm run typecheck      # tsc --noEmit (run `npx next typegen` first on a fresh clone: PageProps/LayoutProps)
npm run cms:manifest   # regenerate the "editor" block of public/storio.template.json
```

There is no test runner.

Storio CLI commands: `storio link` sets `NEXT_PUBLIC_STORIO_TENANT_HOST` in `.env.local`. `storio dev`, `storio unlink`, `storio validate` and `storio publish` do what their names say.

## Architecture

- **Modes** come from `resolveTenant()` in `src/lib/tenant.ts`. Standalone means localhost with no linked tenant. Everything else is a tenant. Never copy this logic into components.
- **Rule 1** (demo data only in Standalone) goes through `withDemoFallback` / `withDemoRecord` in `src/lib/data.ts`. **Rule 2:** no `any`. Type SDK data with SDK interfaces and content with `typeof <page>.json`.
- **The CMS config is split on purpose:**
  - `src/cms/pages.ts` is plain serializable data: pages, sections, defaults, icon names, style presets. Server code imports it, and `scripts/build-cms-manifest.ts` copies it into the manifest for the Storio dashboard.
  - `src/cms/config.ts` adds the lucide icon components and the browser adapter. Import it only from client components.
  - Because of this split, `npx storio-editor doctor` reports a FAIL for "cms.config.ts not found", and the library's `scan`/`add-page` CLI commands don't fit this layout. Add pages by hand (`docs/Storio_Editor_Template_Guide.md` §3).
- **Storage:** `getCmsStorage()` in `src/lib/cms-storage.ts` runs once per request.
  - Standalone uses `fileStorage()` (`.cms/`, git-ignored).
  - A tenant uses `restAdapter` against `STORIO_CMS_API_URL` with an `X-Tenant-Host` header. Without that variable it falls back to a defaults-only read-only store.
- **`src/app/api/cms/[...path]/route.ts`** builds `createCmsRouteHandler` per request. Writes, drafts and collections are allowed only in Standalone under `next dev`. Tenants edit from the Storio dashboard, which writes to the backend directly.
- **Page pattern:**
  - `src/app/(site)/<route>/page.tsx` is a server file with `pageMetadata(key)` from `src/lib/seo.ts`, plus SDK records.
  - It renders `src/components/views/<Name>View.tsx` (client). The view uses `usePageContent` and puts `<CmsField>` around every visible value.
  - `<CmsProviders>` in the root layout already loads all page content server-side.
- **Global page** `site` (`src/content/site.json`) has the sections header, footer, contact, `siteSeo` and theme. Its SEO section is `siteSeo`, not `seo`: `defineCms` rejects a section key that's on both a page and the global page. Library v1.3.4's `getPageMetadata` hardcodes the global `seo` key, so `src/lib/seo.ts` passes the site fallback manually.
- **Theme:** `<CmsThemeStyle>` turns `theme.primaryColor` into `--primary-color`. `globals.css` keeps matching fallbacks in `:root` and maps them to the Tailwind colours `brand`, `accent`, `ink`, `page` and `surface`. Use those classes, not fixed colours.
- **Notices** are a collection (`collection: 'notices'`). `src/lib/notices.ts` loads them through the SDK. Standalone edits go to `.cms/demo-notices.json`.
- On Windows, `src/Components` and `src/components` are the same folder. Keep it lowercase in git.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
