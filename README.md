# Storio Starter Kit

Welcome to the Storio Developer Starter Kit! This template is built with [Next.js](https://nextjs.org) and is pre-configured with the `@storio/template-sdk` to help you rapidly develop and test 3rd-party themes for the Storio CMS platform.

## Getting Started

### 1. Create a New Project via CLI (Recommended)

You can bootstrap a new Storio app using the `@brainicon/create-storio-app` CLI:

```bash
npx @brainicon/create-storio-app my-storio-app
```

Then navigate to your project directory and start the local development server:

```bash
cd my-storio-app
npm run dev
```

### 2. Manual Setup (Cloned Repository)

If you cloned this repository directly, install the dependencies and start the development server:

```bash
npm install
npm run dev
# or yarn / pnpm / bun equivalents
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## IMPORTANT: Read the Documentation First!

Before you start building your template, you **MUST** strictly follow the official documentation provided in the `docs/` folder. Failure to adhere to these guidelines will result in your template being rejected during the deployment review process.

1. **[Storio SDK V2 Guide](./docs/Storio_SDK_V2_Endpoints_and_Methods_Guide.md)**
   This is the complete API and Data Payload reference manual. It contains every SDK method, endpoint path, parameter, and JSON structure you need to fetch data for your template.
   
   **Mandatory Rules to Follow:**
   - **Rule 1 (Mock Data):** While testing locally, you are running in "Standalone Preview" mode. You must use mock data (as described in the SDK guide) since the live Storio CMS backend is not connected to your local environment.
   - **Rule 2 (Strict Typing):** You must strictly type your data payloads using the TypeScript interfaces provided in the SDK. The use of `any` types is strictly prohibited.

2. **[Storio Template Manifest Guide](./docs/Storio_Template_Manifest_Guide.md)**
   This guide explains the purpose, structure, and configuration of the `storio.template.json` file. 

## Storio Manifest Configuration

Before deploying your template to the Storio platform, you **MUST** properly configure the `public/storio.template.json` file. 

- This file serves as the communication bridge between your Next.js template and the Storio CMS backend.
- You currently have a minimal boilerplate file with placeholders. You must update `CHANGE_ME_TO_YOUR_TEMPLATE_ID` and `CHANGE_ME_TO_YOUR_TEMPLATE_NAME` with your actual information.
- You must expand the supported features and customization schema to match exactly what your template supports.
- See the [Manifest Guide](./docs/Storio_Template_Manifest_Guide.md) to understand how to fully populate this file.

**If left unconfigured or improperly configured, your template will fail validation upon deployment.**

## Deployment

Once you have completed your template, rigorously tested it locally using mock data, and accurately configured your `storio.template.json` file, you can submit your repository to the Storio platform for review and integration.
