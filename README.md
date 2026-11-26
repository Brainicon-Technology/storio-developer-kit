# Storio Starter Kit

The starting point for building a **Storio template**: a Next.js website that schools on the Storio platform install and edit from their dashboard.

It comes ready to use:

- **School data connected** with `@storio/template-sdk`: settings, notices, blogs, staff, events and more.
- **Editable from the Storio dashboard** with the Storio editor kit (`src/lib/storio-editor/`, no library to install): every static text, image and icon, page SEO, theme colours, the menu and the header/footer texts.
- **Sample pages for all 44 SDK methods** that already follow every rule: Home, About, Contact, Notices, News, Events, Activities, Staff, Gallery, FAQ, Academics, Results, Calendar, Careers, Board notices, Admission, Citizen charter and custom pages. Each page starts with a comment listing the SDK methods it uses and what they return. Keep the pages your design needs, delete the rest ([Editor Template Guide](./docs/Storio_Editor_Template_Guide.md#the-sample-pages)).

> Looking for the old starter kit (without the editor)? `npx degit Brainicon-Technology/storio-developer-kit#v1-legacy my-template`

---

## Quick start

```bash
# 1. Install the Storio CLI (once)
npm install -g @brainicon/storio-cli

# 2. Create your template
npx @brainicon/create-storio-app my-template
cd my-template
npm install

# 3. Set your template id (format: template-<number>-<name>)
npm run template:id -- template-9-sunrise

# 4. Start it
npm run dev            # http://localhost:3000
```

Then:

1. Read the **[Editor Template Guide](./docs/Storio_Editor_Template_Guide.md)**: how pages are built so schools can edit them.
2. Build your design, using the sample pages as the pattern.
3. Set `name`, `features`, `customization` and `navigation` in `public/storio.template.json` ([Manifest Guide](./docs/Storio_Template_Manifest_Guide.md)).
4. Check and publish (see [Publish](#publish)).

---

## Documentation

Read them in this order:

| Guide | What it covers |
| :--- | :--- |
| **[Editor Template Guide](./docs/Storio_Editor_Template_Guide.md)** | **Start here.** How editing works, project structure, adding an editable page step by step, naming and markup rules, header/footer/Theme settings, records, testing. |
| **[Template Manifest Guide](./docs/Storio_Template_Manifest_Guide.md)** | Every field of `public/storio.template.json`: id, features, Theme settings, menu, editor pages. |
| **[SDK V2 Guide](./docs/Storio_SDK_V2_Endpoints_and_Methods_Guide.md)** | All 44 SDK methods, their data and TypeScript types, and how to load school data. |

---

## The rules

1. **Demo data only in Standalone Preview.** On a real school, show only its own data (or an empty state). Use `resolveTenant()` (`src/lib/tenant.ts`) and `withDemoFallback()` (`src/lib/data.ts`); never copy the host-detection logic.
2. **Strict typing.** Type school data with the SDK types. No `any`.
3. **Editable by default.** Every visible static text, image and icon on a public page is editable (`<CmsSection>` / `<CmsField>`).
4. **Manifest in sync.** Run `npm run editor:sync` after changing `src/content/*.json`, `editorPages` or `editorIcons`. `npm run build` checks it.
5. **Never edit the editor kit** (`src/lib/storio-editor/`). Storio provides the editor, its API and logins: don't add an admin page or an `/api/cms` route.
6. **School data through loaders.** Call each SDK method in a loader in `src/lib/` (Rule 1, error-safe, normalized to the SDK type), never straight from a View. See the Editor Template Guide, section 8.1.

---

## Development modes

| Mode | How | Data |
| :--- | :--- | :--- |
| **Standalone Preview** | `npm run dev` (or after `storio unlink`) | Default page content + demo data (`src/data/defaultDemoData.ts`). No backend needed. |
| **Linked school** | `storio login`, `storio link`, `storio dev` | A real school's data from Storio (the Storio demo school). |

The visual editor itself runs in the Storio dashboard, where your template shows once a version is published and approved. Storio team members can test it on a local Storio (Editor Template Guide, section 9.2).

---

## npm scripts

| Script | Does |
| :--- | :--- |
| `npm run dev` | Start the site (Standalone Preview) |
| `npm run build` | Production build (checks the template id and the editor pages first) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run template:id -- <id>` | Set the template id everywhere (manifest, page keys, content file names) |
| `npm run editor:sync` | Copy `src/content/*.json` into the manifest and regenerate the icon list |
| `npm run editor:check` | Check the manifest, content and icons without changing anything |

---

## Storio CLI

| Command | Does |
| :--- | :--- |
| `storio login` / `storio logout` | Sign in / out with your developer account |
| `storio status` | Show your session and the linked school |
| `storio link` / `storio unlink` | Link the project to the Storio demo school / back to Standalone Preview (writes `.env.local`) |
| `storio dev [-p <port>]` | Start the dev server with the linked school's data |
| `storio validate` | Pre-flight check: manifest, SDK dependency, security scan, `.storioignore` |
| `storio publish -m "<notes>"` | Submit the template (this version) for review |
| `storio collaborator list \| add <email> \| remove <email>` | Manage who may publish your template |
| `storio deploy`, `storio rollback`, `storio fork` | Deploy to / roll back a linked school, or download a school's template |
| `storio --help` | All commands and options |

Add `--local` to a command to use a local Storio backend (`http://127.0.0.1:8000`) instead of Storio cloud; `storio link --local` lets you pick any local school.

---

## Publish

```bash
npm run editor:check            # editor pages, content and icons in sync
npm run build                   # the template builds
storio validate                 # pre-flight check
storio publish -m "Release 1.0.0"
```

Before every publish, increase `"version"` in `public/storio.template.json`. Schools and the dashboard's editor get a new version (and any manifest change) only after it is approved.
