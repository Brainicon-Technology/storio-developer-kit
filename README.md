# Storio Starter Kit

Welcome to the Storio Developer Starter Kit! This template is built with [Next.js](https://nextjs.org) and is pre-configured with the `@storio/template-sdk` to help you rapidly develop and test 3rd-party themes for the Storio CMS platform.

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

1. **[Storio SDK V2 Guide](./docs/Storio_SDK_V2_Endpoints_and_Methods_Guide.md)**
   The complete API and Data Payload reference manual containing all 36 SDK methods, parameter signatures, and TypeScript interfaces.
   
   **Mandatory Platform Rules:**
   - **Rule 1 (Tenant DB vs. Standalone Preview Rule):** When running in Standalone Preview mode (unlinked), fallback to `DEFAULT_DEMO_DATA` if SDK data is empty. When connected to a live tenant domain or linked via CLI, ONLY show real DB data (render a 0-item empty state if empty — NEVER leak demo data on live sites).
   - **Rule 2 (Strict Typing):** Strictly type all data payloads using SDK interfaces. The use of `any` types is strictly prohibited.

2. **[Storio Template Manifest Guide](./docs/Storio_Template_Manifest_Guide.md)**
   Explains the purpose, structure, and configuration schema of `public/storio.template.json`.

---

## Storio Manifest Configuration

Before submitting or deploying your template to the Storio platform, you **MUST** properly configure the `public/storio.template.json` file. 

- This file serves as the communication bridge between your Next.js template and the Storio CMS backend.
- Update `CHANGE_ME_TO_YOUR_TEMPLATE_ID` and `CHANGE_ME_TO_YOUR_TEMPLATE_NAME` with your actual information.
- The `id` field must strictly follow the format: `template-[id number]-[slug]` (e.g., `template-01-horizon` or `template-101-apex`).
- Expand the supported features and customization schema to match exactly what your template supports.
- See the [Manifest Guide](./docs/Storio_Template_Manifest_Guide.md) to understand how to fully populate this file.

**If left unconfigured or improperly configured, your template will fail validation upon deployment.**

---

## Deployment

Once you have completed your template, tested both in Standalone Preview (mock data) and with a linked tenant, and configured your `storio.template.json` file, submit your template to the Storio platform for review and store publication.

Run the pre-flight validation and publish commands:

```bash
# 1. Run pre-flight check
storio validate

# 2. Submit template to Marketplace review queue
storio publish -m "Release v1.0.0"
```
