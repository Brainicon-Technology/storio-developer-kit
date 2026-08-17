# Storio Starter Kit

Welcome to the Storio Developer Starter Kit! This template is built with [Next.js](https://nextjs.org) and is pre-configured with the `@storio/template-sdk` to help you rapidly develop and test 3rd-party themes for the Storio CMS platform.

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

> [!NOTE]
> Use the `--local` flag whenever targeting your local development backend (`http://127.0.0.1:8000`). Once the cloud service is published, commands will connect to production by default.

#### Step 1: Authenticate
```bash
storio login
# Or connect to local backend:
storio login --local
```

#### Step 2: Link to a Tenant Database
```bash
storio link
# Or select from local backend tenants:
storio link --local
```
*(Select your target institution/tenant from the interactive menu. This saves the linked tenant into `.env.local`.)*

#### Step 3: Run the Development Server
```bash
storio dev
# Or with local backend:
storio dev --local
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
- Expand the supported features and customization schema to match exactly what your template supports.
- See the [Manifest Guide](./docs/Storio_Template_Manifest_Guide.md) to understand how to fully populate this file.

**If left unconfigured or improperly configured, your template will fail validation upon deployment.**

---

## Deployment

Once you have completed your template, tested both in Standalone Preview (mock data) and with a linked tenant, and configured your `storio.template.json` file, submit your repository to the Storio platform for review and store publication.
