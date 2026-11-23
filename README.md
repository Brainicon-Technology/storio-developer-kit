# Storio Starter Kit

Welcome to the Storio Developer Starter Kit! This template is built with [Next.js](https://nextjs.org) to help you rapidly develop and test 3rd-party themes for the Storio CMS platform. It comes pre-configured with:

- **`@brainicon/storio-elements-editor`**: makes every text, image, icon, the header, footer, SEO and theme colours editable by the school from the Storio dashboard.
- **`@storio/template-sdk`**: loads the school's database records (notices, blogs, staff, events and so on).

It ships sample pages that are already editable: Home, About, Contact, and a notice board with a detail page. Use them as the pattern for your own pages.

> Looking for the old starter kit (without the editor)? Scaffold it with `npx degit Brainicon-Technology/storio-developer-kit#v1-legacy my-template`.

## CLI Installation

Install the official Storio CLI tool globally:

```bash
npm install -g @brainicon/storio-cli
```

## Getting Started

### 1. Create a New Project via CLI (Recommended)

You can bootstrap a brand-new Storio template using the `@brainicon/create-storio-app` generator:

```bash
npx @brainicon/create-storio-app my-storio-app
cd my-storio-app
```

---

### 2. Development Modes

Storio templates support two distinct development workflows:

| Mode | Command | Data Source | Description |
| :--- | :--- | :--- | :--- |
| **Standalone Preview** | `npm run dev` or `storio unlink` | `DEFAULT_DEMO_DATA` | Visual UI designing and component styling with local mock data. No backend required. |
| **Tenant Gateway** | `storio link` & `storio dev` | Live Tenant DB | Developing and testing with real database records from a connected Storio tenant. |

---

### 3. Development Workflow with Storio CLI

The official **Storio CLI** (`storio`) lets you link templates to tenant databases and run the development server with live data.

#### Step 1: Authenticate
```bash
storio login
```

#### Step 2: Link to a Tenant Database
```bash
storio link
```
*(Select your target institution/tenant from the interactive menu. This saves the linked tenant into `.env.local`.)*

#### Step 3: Run the Development Server
```bash
storio dev
```
Open [http://localhost:3000](http://localhost:3000) to view your template populated with live tenant database records.

#### Step 4: Disconnect / Switch Back to Mock Data
```bash
storio unlink
```
*(Switches your project back to Standalone Preview Mode so you can work with mock data.)*

#### Check Current Status
```bash
storio status
```

---

### 4. Manual Setup (Standalone Mode Only)

If you only want to design components with mock data without connecting to a backend:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

Open [http://localhost:3000/admin/cms](http://localhost:3000/admin/cms) for the **local editor**. Hover any part of a page, click its pencil, and edit. It works only in Standalone Preview under `npm run dev`; real schools edit from the Storio dashboard.

---

## Storio CLI Commands Reference

Quick syntax and command reference for 3rd-party developers:

### Getting Started & Authentication
- `npm install -g @brainicon/storio-cli` - Install CLI globally
- `storio login` - Authenticate with your developer credentials
- `storio status` - View active session, logged-in email, and linked tenant sandbox
- `storio logout` - Log out and delete local authentication session
- `storio --help` - Show general help and list all available commands

### Sandbox & Environment Linking
- `storio link` - Connect template to the live DIU School sandbox (`diu.storio.cloud`)
- `storio unlink` - Disconnect tenant sandbox to preview offline with mock data

### Local Development
- `storio dev` - Start local development server with tenant data
- `storio dev -p 3004` - Start development server on a custom port

### Validation & Security Inspection
- `storio validate` - Pre-flight check: verify manifest schema, size limit, and security

### Publishing to Marketplace
- `storio publish` - Submit template to the Storio Marketplace review queue
- `storio publish -m "Release v1.0.0"` - Submit template with release notes for reviewers

---

## IMPORTANT: Read the Documentation First!

Before you start building your template, you **MUST** strictly follow the official documentation provided in the `docs/` folder:

1. **[Storio Editor Template Guide](./docs/Storio_Editor_Template_Guide.md)**
   How to structure pages so schools can edit them: content JSON, `<CmsSection>`/`<CmsField>`, site-wide content, theme colours, and database records. Start here.

   **Mandatory Editor Rules:**
   - **Rule 3 (Editable by default):** Every visible text, image and icon on a public page must be editable.
   - **Rule 4 (Manifest in sync):** Run `npm run cms:manifest` after changing `src/cms/pages.ts` or `src/content/*.json`.

2. **[Storio SDK V2 Guide](./docs/Storio_SDK_V2_Endpoints_and_Methods_Guide.md)**
   The complete API and Data Payload reference manual containing all 36 SDK methods, parameter signatures, and TypeScript interfaces.
   
   **Mandatory Platform Rules:**
   - **Rule 1 (Tenant DB vs. Standalone Preview Rule):** When running in Standalone Preview mode (unlinked), fallback to `DEFAULT_DEMO_DATA` if SDK data is empty. When connected to a live tenant domain or linked via CLI, ONLY show real DB data (render a 0-item empty state if empty — NEVER leak demo data on live sites).
   - **Rule 2 (Strict Typing):** Strictly type all data payloads using SDK interfaces. The use of `any` types is strictly prohibited.

   Use `resolveTenant()` (`src/lib/tenant.ts`) and `withDemoFallback()` (`src/lib/data.ts`) for Rule 1. Do not copy the host-detection logic.

3. **[Storio Template Manifest Guide](./docs/Storio_Template_Manifest_Guide.md)**
   Explains the purpose, structure, and configuration schema of `public/storio.template.json`.

---

## Storio Manifest Configuration

Before submitting or deploying your template to the Storio platform, you **MUST** properly configure the `public/storio.template.json` file. 

- This file serves as the communication bridge between your Next.js template and the Storio CMS backend.
- Update `CHANGE_ME_TO_YOUR_TEMPLATE_ID` and `CHANGE_ME_TO_YOUR_TEMPLATE_NAME` with your actual information.
- The `id` field must strictly follow the format: `template-[id number]-[slug]` (e.g., `template-01-horizon` or `template-101-apex`).
- List the CMS modules your template supports in `features`.
- Do not write the `editor` block by hand. Generate it with `npm run cms:manifest`, which also sets `"sdkVersion": 2`.
- See the [Manifest Guide](./docs/Storio_Template_Manifest_Guide.md) to understand how to fully populate this file.

**If left unconfigured or improperly configured, your template will fail validation upon deployment.**

---

## Deployment

Once you have completed your template, tested both in Standalone Preview (mock data) and with a linked tenant, and configured your `storio.template.json` file, submit your template to the Storio platform for review and store publication.

Run the pre-flight validation and publish commands:

```bash
# 1. Generate the editor block of the manifest
npm run cms:manifest

# 2. Run pre-flight check
storio validate

# 3. Submit template to Marketplace review queue
storio publish -m "Release v1.0.0"
```
