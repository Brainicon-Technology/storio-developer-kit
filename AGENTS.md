# AGENTS.md

Rules for coding agents working on this Storio template. Claude Code also reads `CLAUDE.md` and the
`storio-page` skill (`.claude/skills/storio-page/SKILL.md`): follow that skill's recipe for any page work.

## Goal

Every page must be editable by a school in the Storio dashboard editor. The Storio backend refuses
saves for pages, sections and fields it doesn't know, so the manifest, the content JSON and the code
must always agree.

## Creating or changing a page or section

1. Template id: `"id"` in `public/storio.template.json`. Page key: `<id>-<name>`.
2. Default content: `src/content/<id>-<name>.json`. One object per section, plus a `seo` section
   (`title`, `description`, `keywords`, `ogImage`). Every visible static word, image and icon is a value here.
3. Manifest: add `{ "key", "title", "route", "sections": [{ "key", "label" }] }` to `editorPages`,
   with sections matching the JSON keys. New icons go in `editorIcons`. Never `"global": true`, never a
   section named `navigation`, `colors` or `content`. Run `npm run editor:sync`.
4. Text hook: `src/components/cms/use<Name>Text.ts` (copy `useAboutText.ts`).
5. View: `src/components/views/<Name>View.tsx` (`'use client'`):
   - `const PAGE = '<id>-<name>'`;
   - one `<CmsSection sectionKey="..." title="..." page={PAGE}>` per section (not `seo`);
   - every static value wrapped: `<CmsField path="title" label="Title">{text.title}</CmsField>`, lists as
     `` path={`list.${i}.title`} ``;
   - no literal words in JSX, `{'...'}`, `alt`, `placeholder`, `title` or `aria-label`;
   - school data (SDK) shown without `<CmsField>`. Exceptions are record fields: notice `title` (by id),
     blog `title`/`excerpt` (by slug), event `title`/`excerpt`/`location` (by slug);
   - empty data sections hidden for visitors but kept in the editor (`useInEditor`, `<EmptyInEditor>`);
   - theme colour classes only (`bg-brand`, `text-accent`, `bg-surface`...), no hex colours;
   - no `any`, no demo-data imports.
6. Server page: `src/app/(site)/<route>/page.tsx` with `generateMetadata()` returning
   `pageMetadata('<id>-<name>')`, and data from loaders in `src/lib` (`safely` → normalizer → `withDemoFallback`).
7. `[slug]` pages other than notice/blog/event can't be editor pages: put their labels in a `detail`
   section of the list page and add the route to `OTHER_ROUTES` in `src/lib/routes.ts`.

## Before finishing

```bash
npm run storio:check   # editor:check + pages:check + typecheck + lint
```

It must pass with no errors. `npm run build` runs the same page checks.

Never edit `src/lib/storio-editor/` (a fixed protocol copied from Storio). Full guide:
`docs/Storio_Editor_Template_Guide.md`.
