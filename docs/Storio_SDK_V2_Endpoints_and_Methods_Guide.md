# Storio Template SDK (v2) — Comprehensive Developer API & Data Reference Manual

> **Last Updated:** November 25, 2026 | **SDK Version:** `@storio/template-sdk@1.0.1` | **Platform:** Storio CMS v2

Welcome 3rd-party template developers! 

This is the **complete, official API and Data Payload reference manual** for `@storio/template-sdk` (bundled in your starter template under `packages/storio-template-sdk-1.0.1.tgz`).

Every single SDK method, backend V2 endpoint path, method signature, parameter, TypeScript type interface, and exact JSON data payload structure from `packages/template-sdk/src/index.ts` is documented below.

> [!NOTE]
> **The SDK loads the school's own data** (settings, notices, blogs, staff, events...). That data is edited on the dashboard's own pages and gets **no editor pencil**. The static texts, images and icons of your pages are page content, made editable with the Storio editor: see the [Editor Template Guide](./Storio_Editor_Template_Guide.md). Both work together on the same page (section 6).

---

## Table of Contents

- [1. Quick Start & Setup](#1-quick-start--setup)
  - [Importing the SDK](#importing-the-sdk)
  - [Key SDK Capabilities](#key-sdk-capabilities)
  - [Fetching Live Database Data with Storio CLI](#fetching-live-database-data-with-storio-cli)
  - [Mandatory Rules for Template Developers](#mandatory-rules-for-template-developers)
    - [Rule 1: Tenant DB vs. Standalone Preview Mock Data Rule](#rule-1-tenant-db-vs-standalone-preview-mock-data-rule)
    - [Rule 2: Strict Typing Rule (No any Types Allowed)](#rule-2-strict-typing-rule-no-any-types-allowed)
- [2. Complete SDK Method & Endpoint Index (44 Methods)](#2-complete-sdk-method--endpoint-index-44-methods)
- [3. Detailed Method & Data Payload Reference](#3-detailed-method--data-payload-reference)
  - [Section 1: Site Identity & Layout Configs (Methods 1–5)](#section-1-site-identity--layout-configs)
  - [Section 2: Hero Carousel Banners (Method 6)](#section-2-hero-carousel-banners)
  - [Section 3: Public Notice Board & Announcements (Methods 7–8)](#section-3-public-notice-board--announcements)
  - [Section 4: Blogs & News Articles (Methods 9–10)](#section-4-blogs--news-articles)
  - [Section 5: Faculty, Staff & Board Directory (Methods 11–12)](#section-5-faculty-staff--board-directory)
  - [Section 6: Media Gallery & Photo Albums (Methods 13–14)](#section-6-media-gallery--photo-albums)
  - [Section 7: School Activities & Events (Methods 15–18)](#section-7-school-activities--events)
  - [Section 8: Dynamic CMS Custom Builder Pages (Method 19)](#section-8-dynamic-cms-custom-builder-pages)
  - [Section 9: Social Proof, Leadership & Promotions (Methods 20–22)](#section-9-social-proof-leadership--promotions)
  - [Section 10: Quick Links, FAQs, Videos & Exam Results (Methods 23–27)](#section-10-quick-links-faqs-videos--exam-results)
  - [Section 11: Careers & Recruitment (Methods 28–29)](#section-11-careers--recruitment)
  - [Section 12: National Education Board Notice Sync (Method 30)](#section-12-national-education-board-notice-sync)
  - [Section 13: Online Admission Portal & Interactive Forms (Methods 31–35)](#section-13-online-admission-portal--interactive-forms)
  - [Section 14: Academics (Class Routines, Syllabuses, Student Stats, Academic Programs) (Methods 36–39)](#section-14-academics)
  - [Section 15: Citizen Charter & Institutional Compliance (Methods 40–43)](#section-15-citizen-charter--institutional-compliance)
  - [Section 16: Core API Fetcher (Method 44)](#section-16-core-api-fetcher-apifetch)
- [4. Complete TypeScript Type Interfaces (46 Interfaces)](#4-complete-typescript-type-interfaces)
- [5. Architectural Best Practices & Error Handling](#5-architectural-best-practices--error-handling)
- [6. Using the SDK in the Starter Kit (Examples)](#6-using-the-sdk-in-the-starter-kit-examples)
  - [Example 1: A list page with editable texts](#example-1-a-list-page-with-editable-texts)
  - [Example 2: A record detail page](#example-2-a-record-detail-page)
  - [Example 3: A form (Server Action)](#example-3-a-form-server-action)

---

## 1. Quick Start & Setup

### Importing the SDK

The SDK is already installed in the starter kit (bundled as `packages/storio-template-sdk-1.0.1.tgz`, listed in `package.json`). Do not install it from npm.

Import the singleton instance `storio` and the TypeScript types anywhere in your server code:

```typescript
import { storio, type StorioNotice, type StorioBlogPost } from '@storio/template-sdk';
```

### Key SDK Capabilities

- **Multi-tenant:** every method takes the school's host (`tenantHost`). In the starter kit, get it from `resolveTenant()` (`src/lib/tenant.ts`).
- **Server-first:** built on `fetch`; use it in Server Components, Server Actions and Route Handlers, with Next.js cache options (`next: { revalidate: 60 }`).
- **44 methods** covering settings, notices, blogs, staff, events, admissions, academics and compliance.
- **Fail-safe:** methods return `null` (or an empty list) on network errors instead of throwing.

---

### Fetching Live Database Data with Storio CLI

By default the starter kit runs in **Standalone Preview**: demo data on `localhost`. To see real school data, link the template with the Storio CLI:

```bash
storio login          # sign in with your developer account
storio link           # link this project to the Storio demo school
storio dev            # start Next.js with the linked school's data
storio unlink         # back to Standalone Preview (demo data)
```

`storio link` writes `NEXT_PUBLIC_STORIO_TENANT_HOST` (the school) and `NEXT_PUBLIC_API_URL` (the Storio backend) to `.env.local`.

Storio team members with a local Storio backend add `--local` to every command (`storio login --local`, `storio link --local`, `storio dev --local`): `link --local` lets you pick any local school.

---

### Mandatory Rules for Template Developers

#### Rule 1: Tenant DB vs. Standalone Preview Mock Data Rule

> [!IMPORTANT]
> **The Golden Data Fallback Rule:**
> 1. On a live school domain, or when linked with `storio link`, the template **MUST show only the school's real data**. If a list is empty (0 notices, 0 blogs), show an empty state or hide the section. **NEVER show demo data to a real school.**
> 2. In Standalone Preview (`localhost` with no linked school), the template **falls back to the demo data** (`DEFAULT_DEMO_DATA` in `src/data/defaultDemoData.ts`), so the design can be previewed.

The starter kit implements this rule once. **Use its helpers; never copy the host-detection logic into your code:**

- `resolveTenant()` (`src/lib/tenant.ts`) returns `{ tenantHost, isStandalone }` for the current request;
- `withDemoFallback(real, demo, isStandalone)` (lists) and `withDemoRecord(real, demo, isStandalone)` (one record) in `src/lib/data.ts` apply the rule.

#### Golden Code Pattern for Data Fetching:

```typescript
// src/lib/notices.ts (in the starter kit)
import { storio, type StorioNotice } from '@storio/template-sdk';
import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { withDemoFallback, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

export async function loadNotices(ctx: TenantContext): Promise<StorioNotice[]> {
  const real = await storio.getNotices(ctx.tenantHost);
  return withDemoFallback(real, DEFAULT_DEMO_DATA.notices, ctx.isStandalone);
}

export async function loadNotice(id: string, ctx: TenantContext): Promise<StorioNotice | null> {
  const real = await storio.getNoticeDetail(id, ctx.tenantHost);
  const demo = DEFAULT_DEMO_DATA.notices.find((n) => String(n.id) === id);
  return withDemoRecord(real, demo, ctx.isStandalone);
}
```

```tsx
// in a server page
const notices = await loadNotices(await resolveTenant());
```

Write one loader like this per kind of data (in `src/lib/`), and add matching demo data to `DEFAULT_DEMO_DATA`.

### Rule 2: Strict Typing Rule (No `any` Types Allowed)
Every component, utility, and state hook must use the exported TypeScript interfaces provided by `@storio/template-sdk`. The use of `any`, `unknown` casts without guards, or loose objects is strictly prohibited.

---

## 2. Complete SDK Method & Endpoint Index (44 Methods)

| # | SDK Method Signature | HTTP | Endpoint Path | Query Parameters / Body | Return Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `storio.getSettings(host?)` | `GET` | `/api/v2/template/settings/` | None | `Promise<StorioSettingsResponse \| null>` |
| 2 | `storio.getCustomization(host?)` | `GET` | `/api/v2/template/customization/` | None | `Promise<StorioCustomizationResponse \| null>` |
| 3 | `storio.getNavigation(host?)` | `GET` | `/api/v2/template/navigation/` | None | `Promise<StorioNavigationResponse \| null>` |
| 4 | `storio.getLayout(host?)` | `GET` | `/api/v2/template/layout/` | None | `Promise<StorioLayoutResponse \| null>` |
| 5 | `storio.getInstitutionProfile(host?)` | `GET` | `/api/v2/template/institution-profile/` | None | `Promise<StorioInstitutionProfile \| null>` |
| 6 | `storio.getHeroSlides(host?)` | `GET` | `/api/v2/template/hero-slides/` | None | `Promise<StorioHeroSlide[] \| null>` |
| 7 | `storio.getNotices(host?)` | `GET` | `/api/v2/template/notices/` | `search`, `status` | `Promise<StorioNotice[] \| null>` |
| 8 | `storio.getNoticeDetail(id, host?)` | `GET` | `/api/v2/template/notices/${id}/` | None | `Promise<StorioNotice \| null>` |
| 9 | `storio.getBlogs(host?)` | `GET` | `/api/v2/template/blogs/` | `search`, `category` | `Promise<StorioBlogPost[] \| null>` |
| 10 | `storio.getBlogDetail(slug, host?)` | `GET` | `/api/v2/template/blogs/${slug}/` | None | `Promise<StorioBlogPost \| null>` |
| 11 | `storio.getStaff(host?)` | `GET` | `/api/v2/template/staff/` | None | `Promise<StorioStaffMember[] \| null>` |
| 12 | `storio.getTeam(host?)` | `GET` | `/api/v2/template/team/` | `section` | `Promise<StorioTeamMember[] \| null>` |
| 13 | `storio.getGallery(host?)` | `GET` | `/api/v2/template/gallery/` | None | `Promise<StorioGalleryItem[] \| null>` |
| 14 | `storio.getAlbums(host?)` | `GET` | `/api/v2/template/albums/` | None | `Promise<StorioAlbum[] \| null>` |
| 15 | `storio.getActivities(host?)` | `GET` | `/api/v2/template/activities/` | `search`, `category` | `Promise<StorioActivityItem[] \| null>` |
| 16 | `storio.getActivityDetail(slug, host?)` | `GET` | `/api/v2/template/activities/${slug}/` | None | `Promise<StorioActivityItem \| null>` |
| 17 | `storio.getEvents(host?)` | `GET` | `/api/events/` | `search`, `status`, `categories`, `is_featured`, `ordering` | `Promise<StorioEvent[] \| null>` |
| 18 | `storio.getEventDetail(slugOrId, host?)` | `GET` | `/api/events/${slugOrId}/` | None | `Promise<StorioEvent \| null>` |
| 19 | `storio.getPageBySlug(slug, host?)` | `GET` | `/api/v2/template/pages/by-slug/${slug}/` | None | `Promise<StorioCustomPage \| null>` |
| 20 | `storio.getTestimonials(host?)` | `GET` | `/api/v2/template/testimonials/` | None | `Promise<Record<string, unknown>[] \| null>` |
| 21 | `storio.getLeadershipMessages(host?)` | `GET` | `/api/v2/template/leadership-messages/` | None | `Promise<Record<string, unknown>[] \| null>` |
| 22 | `storio.getPromotions(host?)` | `GET` | `/api/v2/template/promotions/` | `type`, `target` | `Promise<StorioPromotion[] \| null>` |
| 23 | `storio.getImportantLinks(host?)` | `GET` | `/api/v2/template/important-links/` | None | `Promise<StorioImportantLink[] \| null>` |
| 24 | `storio.getFaqs(host?)` | `GET` | `/api/v2/template/faqs/` | None | `Promise<StorioFaq[] \| null>` |
| 25 | `storio.getVideos(host?)` | `GET` | `/api/v2/template/reels/` | None | `Promise<StorioVideoItem[] \| null>` |
| 26 | `storio.getCalendarEvents(host?)` | `GET` | `/api/v2/template/calendar/` | None | `Promise<StorioCalendarEvent[] \| null>` |
| 27 | `storio.getExamResults(host?)` | `GET` | `/api/v2/template/exam-results/` | `exam_type` | `Promise<StorioExamResult[] \| null>` |
| 28 | `storio.getCareers(host?)` | `GET` | `/api/v2/template/careers/jobs/` | `location` | `Promise<Record<string, unknown>[] \| null>` |
| 29 | `storio.getJobDetail(slug, host?)` | `GET` | `/api/v2/template/careers/jobs/${slug}/` | None | `Promise<Record<string, unknown> \| null>` |
| 30 | `storio.getBoardNotices(host?)` | `GET` | `/api/v2/template/board-notices/` | None | `Promise<StorioBoardNotice[] \| null>` |
| 31 | `storio.getAdmissionFormConfig(host?)` | `GET` | `/api/v2/template/admission/form-config/current/` | None | `Promise<StorioAdmissionFormConfig \| null>` |
| 32 | `storio.sendAdmissionOTP(email, phone?, host?)` | `POST` | `/api/v2/template/admission/send-otp/` | Body: `{ email, phone? }` | `Promise<StorioAdmissionOTPResponse \| null>` |
| 33 | `storio.verifyAdmissionOTP(email, otpCode, host?)` | `POST` | `/api/v2/template/admission/verify-otp/` | Body: `{ email, otp_code }` | `Promise<StorioAdmissionOTPResponse \| null>` |
| 34 | `storio.submitAdmissionApplication(formData, otpCode, host?)` | `POST` | `/api/v2/template/admission/applications/` | Body: `{ form_data, otp_code }` | `Promise<StorioAdmissionApplicationResponse \| null>` |
| 35 | `storio.submitContactMessage(formData, host?)` | `POST` | `/api/v2/template/contact/` | Body: `{ name, email, mobile, subject, message, recaptcha_token? }` | `Promise<StorioContactFormResponse \| null>` |
| 36 | `storio.getClassRoutines(host?)` | `GET` | `/api/v2/template/academic/class-routines/` | `class_name`, `section`, `shift`, `year` | `Promise<StorioClassRoutine[] \| null>` |
| 37 | `storio.getSyllabuses(host?)` | `GET` | `/api/v2/template/academic/syllabuses/` | `class_name`, `exam_type`, `year` | `Promise<StorioSyllabus[] \| null>` |
| 38 | `storio.getStudentStats(params?, host?)` | `GET` | `/api/v2/template/student-stats/` | `year`, `program` | `Promise<StorioStudentStatsResponse \| null>` |
| 39 | `storio.getAcademicPrograms(host?)` | `GET` | `/api/v2/template/academic/programs/` | None | `Promise<StorioAcademicProgram[]>` |
| 40 | `storio.getMpoInfo(host?)` | `GET` | `/api/v2/template/mpo-info/` | None | `Promise<StorioMpoInfo \| null>` |
| 41 | `storio.getInformationService(host?)` | `GET` | `/api/v2/template/information-service/` | None | `Promise<StorioInformationService \| null>` |
| 42 | `storio.getComplaintOfficer(host?)` | `GET` | `/api/v2/template/complaint-officer/` | None | `Promise<StorioComplaintOfficer \| null>` |
| 43 | `storio.getHotlines(host?)` | `GET` | `/api/v2/template/hotlines/` | None | `Promise<StorioHotline[] \| null>` |
| 44 | `storio.apiFetch<T>(endpoint, options?)` | `GET/POST` | `*` | Custom Options | `Promise<T \| null>` |

---

## 3. Detailed Method & Data Payload Reference

### Section 1: Site Identity & Layout Configs

#### 1. `storio.getSettings(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/settings/`
- **Method Signature:** `storio.getSettings(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioSettingsResponse | null>`
- **Description:** Returns general site identity metadata like site title, tagline, branding logos, contact info, and social media links.
- **Data Payload Obtained:**
  ```json
  {
    "site_title": "Emerald International Academy",
    "site_tagline": "Empowering Future Innovators",
    "logo_url": "https://tenant.storio.app/media/branding/logo.png",
    "favicon_url": "https://tenant.storio.app/media/branding/favicon.ico",
    "contact_email": "admissions@emeraldacademy.edu",
    "phone_number": "+880 1711-000000",
    "mailing_address": "House 14, Road 5, Dhanmondi, Dhaka-1205",
    "hcaptcha_site_key": "10000000-ffff-ffff-ffff-000000000001",
    "social_links": [
      { "platform": "facebook", "url": "https://facebook.com/emeraldacademy" },
      { "platform": "youtube", "url": "https://youtube.com/@emeraldacademy" },
      { "platform": "linkedin", "url": "https://linkedin.com/school/emeraldacademy" }
    ]
  }
  ```

#### 2. `storio.getCustomization(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/customization/`
- **Method Signature:** `storio.getCustomization(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCustomizationResponse | null>`
- **Description:** Returns the school's **Theme settings** values: the fields you declare in the manifest's `customization` and `navigation` (see the [Manifest Guide](./Storio_Template_Manifest_Guide.md)). The keys of `config` are your manifest field ids. A field the school never changed may be missing: fall back to its manifest `default`.
- **In the starter kit:** use `loadTheme()` from `src/lib/theme.ts`, which does this fallback for you.
- **Data Payload Obtained** (for a manifest with `primaryColor`, `footer_tagline` and `navbarLinks`):
  ```json
  {
    "config": {
      "primaryColor": "#059669",
      "footer_tagline": "Learning for life.",
      "navbarLinks": [
        { "id": "1", "name": "Home", "href": "/" },
        { "id": "2", "name": "About", "href": "/about", "subLinks": [{ "id": "2-1", "name": "History", "href": "/about/history" }] }
      ]
    }
  }
  ```

#### 3. `storio.getNavigation(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/navigation/`
- **Method Signature:** `storio.getNavigation(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNavigationResponse | null>`
- **Description:** Returns the school's menu: the `navbarLinks` value of Theme settings, as `items`.
- **Note:** the backend returns the links in the manifest's shape (`id`, `name`, `href`, `subLinks`), while the SDK's TypeScript type describes `label`/`url`/`children`. Until the type is fixed, read the menu with `loadTheme()` + `themeNavLinks()` from `src/lib/theme.ts`, as the starter kit's header does.
- **Data Payload Obtained:**
  ```json
  {
    "items": [
      { "id": "1", "name": "Home", "href": "/" },
      { "id": "2", "name": "About", "href": "/about", "subLinks": [{ "id": "2-1", "name": "History", "href": "/about/history" }] }
    ]
  }
  ```

#### 4. `storio.getLayout(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/layout/`
- **Method Signature:** `storio.getLayout(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioLayoutResponse | null>`
- **Description:** `settings`, `customization` and `navigation` in one response (the three methods above).
- **Data Payload Obtained:**
  ```json
  {
    "settings": {
      "site_title": "Emerald International Academy",
      "site_tagline": "Empowering Future Innovators",
      "logo_url": "https://tenant.storio.app/media/branding/logo.png",
      "contact_email": "admissions@emeraldacademy.edu",
      "phone_number": "+880 1711-000000",
      "social_links": [{ "platform": "facebook", "url": "https://facebook.com/emeraldacademy" }]
    },
    "customization": { "config": { "primaryColor": "#059669" } },
    "navigation": { "items": [{ "id": "1", "name": "Home", "href": "/" }] }
  }
  ```

#### 5. `storio.getInstitutionProfile(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/institution-profile/`
- **Method Signature:** `storio.getInstitutionProfile(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioInstitutionProfile | null>`
- **Description:** Institutional identity details, including ministry EIN/EIIN registration codes, founding year, academic recognitions, and legal accreditation certificates.
- **Data Payload Obtained:**
  ```json
  {
    "id": 1,
    "name": "Emerald International Academy",
    "short_name": "EIA",
    "eiin": "130456",
    "institute_code": "EI-9921",
    "established_year": 1994,
    "motto": "Knowledge, Character, Innovation",
    "email": "info@emeraldacademy.edu",
    "phone": "+880 2 99887766",
    "address": "Dhanmondi Campus, Dhaka-1205, Bangladesh",
    "about_text": "A premier English-medium educational institution serving over 2,500 students.",
    "recognitions": [
      {
        "id": 1,
        "title": "Cambridge Assessment International Education Affiliation",
        "issuing_authority": "Cambridge International Education",
        "issue_date": "2008-05-12",
        "expiry_date": null,
        "is_lifetime": true,
        "description": "Accredited British Curriculum Center BD-042",
        "documents": [
          {
            "id": 10,
            "title": "Cambridge Accreditation Certificate",
            "document_file": "https://tenant.storio.app/media/accreditations/cambridge_cert.pdf",
            "uploaded_at": "2024-01-15T09:00:00Z"
          }
        ]
      }
    ]
  }
  ```

---

### Section 2: Hero Carousel Banners

#### 6. `storio.getHeroSlides(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/hero-slides/`
- **Method Signature:** `storio.getHeroSlides(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioHeroSlide[] | null>`
- **Description:** Carousel slider banners displayed on the home page hero section, complete with CTA buttons, headlines, and responsive background images.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Admissions Open for Academic Session 2026–2027",
      "subtitle": "Join a vibrant community of scholars, athletes, and future innovators.",
      "image_url": "https://tenant.storio.app/media/hero/banner_admissions_2026.jpg",
      "button_text": "Apply Online",
      "button_url": "/admissions/apply",
      "order": 1
    },
    {
      "id": 2,
      "title": "State-of-the-Art Science & Robotics Facilities",
      "subtitle": "Inspiring hands-on learning from Grade 1 through A-Levels.",
      "image_url": "https://tenant.storio.app/media/hero/banner_robotics_lab.jpg",
      "button_text": "Explore Campus",
      "button_url": "/about/infrastructure",
      "order": 2
    }
  ]
  ```

---

### Section 3: Public Notice Board & Announcements

#### 7. `storio.getNotices(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/notices/`
- **Method Signature:** `storio.getNotices(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNotice[] | null>`
- **Description:** List of public notices, circulars, and announcements with optional filtering.
- **Query Parameters Supported:**
  - `search` (`string`): Search across title and notice content.
  - `status` (`string`): Filter by notice status (`published`).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 101,
      "title": "Annual Sports Meet & Schedule Guidelines 2026",
      "slug": "annual-sports-meet-schedule-guidelines-2026",
      "published_date": "2026-02-20T08:00:00Z",
      "is_urgent": true,
      "attachment_url": "https://tenant.storio.app/media/notices/sports_guidelines_2026.pdf"
    },
    {
      "id": 102,
      "title": "First Term Examination Routine 2026",
      "slug": "first-term-examination-routine-2026",
      "published_date": "2026-02-18T10:00:00Z",
      "is_urgent": false,
      "attachment_url": "https://tenant.storio.app/media/notices/exam_routine_t1.pdf"
    }
  ]
  ```

#### 8. `storio.getNoticeDetail(id, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/notices/${id}/`
- **Method Signature:** `storio.getNoticeDetail(id: number | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNotice | null>`
- **Description:** Single notice detail view containing full sanitized HTML/markdown content, document attachment details, view modes, and publishing metadata.
- **Parameters:**
  - `id` (`number | string`): The unique numeric ID of the notice.
  - `tenantHostOrOptions` (`string | StorioFetchOptions`, optional): Target tenant hostname or fetch options.
- **Data Payload Obtained:**
  ```json
  {
    "id": 101,
    "title": "Annual Sports Meet & Schedule Guidelines 2026",
    "content": "<p>All students, faculty members, and guardians are hereby informed that the Annual Sports Competition 2026 will be held across three phases from March 5th to March 8th at the Central Stadium...</p>",
    "status": "published",
    "publish_date": "2026-02-20T08:00:00Z",
    "create_date": "2026-02-18T10:15:30Z",
    "update_date": "2026-02-19T14:30:00Z",
    "deleted_at": null,
    "created_by": "admin",
    "pdf_view_mode": true,
    "attachments": [12],
    "attachments_detail": [
      {
        "id": 12,
        "file": "https://tenant.storio.app/media/notices/sports_guidelines_2026.pdf",
        "file_type": "document",
        "file_name": "sports_guidelines_2026.pdf",
        "file_size": 2457600,
        "file_size_display": "2.34 MB",
        "alt_text": "Annual Sports Meet Official Guidelines PDF",
        "uploaded_by": "admin",
        "create_date": "2026-02-18T10:14:00Z",
        "update_date": "2026-02-18T10:14:00Z"
      }
    ]
  }
  ```

---

### Section 4: Blogs & News Articles

#### 9. `storio.getBlogs(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/blogs/`
- **Method Signature:** `storio.getBlogs(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioBlogPost[] | null>`
- **Description:** List of published blog articles, news stories, and press releases.
- **Query Parameters Supported:**
  - `search` (`string`): Search across title, excerpt, and body content.
  - `category` (`string`): Filter by category slug or ID.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 14,
      "title": "Modern Approaches in Digital Education & Interactive Classrooms",
      "slug": "modern-approaches-digital-education",
      "summary": "Exploring pedagogical shifts and smart classroom technologies transforming student collaboration.",
      "featured_image_url": "https://tenant.storio.app/media/blogs/digital_classroom.jpg",
      "category_name": "Academic Insights",
      "published_at": "2026-02-15T09:00:00Z"
    },
    {
      "id": 15,
      "title": "Students Triumph at Regional Robotics Championship",
      "slug": "students-triumph-robotics-championship",
      "summary": "Our middle school robotics squad secured first place in autonomous navigation.",
      "featured_image_url": "https://tenant.storio.app/media/blogs/robotics_win.jpg",
      "category_name": "Student Life",
      "published_at": "2026-02-12T14:30:00Z"
    }
  ]
  ```

#### 10. `storio.getBlogDetail(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/blogs/${slug}/`
- **Method Signature:** `storio.getBlogDetail(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioBlogPost | null>`
- **Description:** Full article details by slug for single blog post pages, including rich-text HTML content, featured media file details, author attribution, categorization, and SEO tags.
- **Parameters:**
  - `slug` (`string`): The URL slug identifier of the blog post.
  - `tenantHostOrOptions` (`string | StorioFetchOptions`, optional): Target tenant hostname or fetch options.
- **Data Payload Obtained:**
  ```json
  {
    "id": 14,
    "title": "Modern Approaches in Digital Education & Interactive Classrooms",
    "slug": "modern-approaches-digital-education",
    "content": "<p>Integrating interactive smart boards and modular project-based learning into secondary curricula fosters deeper analytical thinking. Recent studies demonstrate a 35% increase in comprehension when students engage with peer-led collaborative modules...</p>",
    "excerpt": "Exploring pedagogical shifts and smart classroom technologies transforming student collaboration.",
    "author": "Dr. Sarah Jenkins",
    "status": "published",
    "status_display": "Published",
    "tags": "education, technology, innovation",
    "publish_date": "2026-02-15T09:00:00Z",
    "deleted_at": null,
    "created_by": 1,
    "featured_image": 42,
    "featured_image_data": {
      "id": 42,
      "file": "https://tenant.storio.app/media/blogs/digital_classroom.jpg",
      "file_type": "image",
      "file_name": "digital_classroom.jpg",
      "file_size": 1540000,
      "file_size_display": "1.47 MB",
      "alt_text": "Students collaborating in a smart interactive classroom",
      "uploaded_by": "admin",
      "create_date": "2026-02-15T08:45:00Z",
      "update_date": "2026-02-15T08:45:00Z"
    },
    "seo_title": "Modern Digital Education Trends | Storio",
    "seo_description": "Discover how interactive digital tools elevate student performance and retention.",
    "view_count": 328,
    "is_featured": true,
    "categories": [3],
    "categories_data": [
      {
        "id": 3,
        "name": "Academic Insights",
        "slug": "academic-insights",
        "description": "Pedagogical research and educational technology trends",
        "parent": null,
        "parent_name": null,
        "posts_count": 8,
        "create_date": "2026-01-10T12:00:00Z",
        "update_date": "2026-01-10T12:00:00Z"
      }
    ],
    "create_date": "2026-02-15T08:50:00Z",
    "update_date": "2026-02-16T11:20:00Z"
  }
  ```

---

### Section 5: Faculty, Staff & Board Directory

#### 11. `storio.getStaff(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/staff/`
- **Method Signature:** `storio.getStaff(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioStaffMember[] | null>`
- **Description:** Complete staff roster including teachers, department heads, and administrative staff.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "name": "Prof. Arthur Pendelton",
      "designation": "Principal & Head of Academics",
      "department": "Administration",
      "email": "principal@emeraldacademy.edu",
      "phone": "+880 1711-111111",
      "photo_url": "https://tenant.storio.app/media/staff/principal.jpg",
      "qualification": "Ph.D. in Educational Leadership, Oxford University",
      "order": 1
    },
    {
      "id": 2,
      "name": "Dr. Eleanor Vance",
      "designation": "Head of Natural Sciences",
      "department": "Science",
      "email": "e.vance@emeraldacademy.edu",
      "phone": "+880 1711-222222",
      "photo_url": "https://tenant.storio.app/media/staff/dr_vance.jpg",
      "qualification": "M.Sc. Physics (Distinction), Imperial College London",
      "order": 2
    }
  ]
  ```

#### 12. `storio.getTeam(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/team/`
- **Method Signature:** `storio.getTeam(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioTeamMember[] | null>`
- **Description:** Executive leadership, Governing Body, Board of Trustees, and Managing Committee members.
- **Query Parameters Supported:**
  - `section` (`string`): Filter by governance section (`governing_body`, `board_of_trustees`, `executive_committee`).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "name": "Dr. Tariq Ahmed",
      "role": "Chairman, Board of Governors",
      "designation": "Senior Educationist & Former Vice-Chancellor",
      "bio": "Distinguished academic leader guiding educational policy and institutional modernization.",
      "photo_url": "https://tenant.storio.app/media/team/chairman.jpg",
      "section": "governing_body",
      "order": 1
    }
  ]
  ```

---

### Section 6: Media Gallery & Photo Albums

#### 13. `storio.getGallery(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/gallery/`
- **Method Signature:** `storio.getGallery(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioGalleryItem[] | null>`
- **Description:** Standalone photo gallery showcase items with titles and album associations.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Annual Science Fair 2026",
      "image_url": "https://tenant.storio.app/media/gallery/science_fair_1.jpg",
      "thumbnail_url": "https://tenant.storio.app/media/gallery/thumbs/science_fair_1.jpg",
      "album_id": 3,
      "album_title": "Campus Exhibitions",
      "created_at": "2026-02-10T12:00:00Z"
    }
  ]
  ```

#### 14. `storio.getAlbums(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/albums/`
- **Method Signature:** `storio.getAlbums(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAlbum[] | null>`
- **Description:** Photo albums with cover photos and total photo count.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 3,
      "title": "Campus Exhibitions & Fairs",
      "slug": "campus-exhibitions-fairs",
      "description": "Snapshots from student exhibitions, robotics contests, and art showcases.",
      "cover_image_url": "https://tenant.storio.app/media/gallery/science_fair_cover.jpg",
      "total_photos": 48
    }
  ]
  ```

---

### Section 7: School Activities & Events

#### 15. `storio.getActivities(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/activities/`
- **Method Signature:** `storio.getActivities(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioActivityItem[] | null>`
- **Description:** List of co-curricular student activities, workshops, sports clubs, and robotics sessions.
- **Query Parameters Supported:**
  - `search` (`string`): Search across activity titles and descriptions.
  - `category` (`string`): Filter by activity category slug or ID.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 9,
      "title": "Robotics & STEM Innovation Workshop 2026",
      "slug": "robotics-stem-innovation-workshop-2026",
      "summary": "Over 120 students built autonomous rovers and prototyped microcontrollers in our annual STEM workshop.",
      "featured_image_url": "https://tenant.storio.app/media/activities/stem_rover_demo.jpg",
      "published_at": "2026-02-22T09:30:00Z"
    },
    {
      "id": 10,
      "title": "Debate Club National Championship Preparation",
      "slug": "debate-club-national-championship-prep",
      "summary": "Intensive parliamentary debate sparring sessions focusing on economics and ethics.",
      "featured_image_url": "https://tenant.storio.app/media/activities/debate_club.jpg",
      "published_at": "2026-02-18T11:00:00Z"
    }
  ]
  ```

#### 16. `storio.getActivityDetail(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/activities/${slug}/`
- **Method Signature:** `storio.getActivityDetail(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioActivityItem | null>`
- **Description:** Fetches complete activity details for workshops, sports clubs, arts exhibitions, and extracurricular programs by slug, including full gallery photos, categories, and HTML description.
- **Parameters:**
  - `slug` (`string`): The URL slug identifier of the activity.
  - `tenantHostOrOptions` (`string | StorioFetchOptions`, optional): Target tenant hostname or custom fetch options.
- **Data Payload Obtained:**
  ```json
  {
    "id": 9,
    "title": "Robotics & STEM Innovation Workshop 2026",
    "slug": "robotics-stem-innovation-workshop-2026",
    "content": "<p>Our annual STEM Innovation Workshop brought together over 120 aspiring junior engineers to design, build, and program autonomous obstacle-avoidance rovers. Highlights included live microcontroller coding demonstrations and circuit prototyping competitions...</p>",
    "excerpt": "Over 120 students built autonomous rovers and prototyped microcontrollers in our annual STEM workshop.",
    "author": "Department of Computer Science",
    "status": "published",
    "status_display": "Published",
    "deleted_at": null,
    "created_by": 2,
    "gallery_images": [
      {
        "id": 18,
        "image_id": 105,
        "image_details": {
          "id": 105,
          "file": "https://tenant.storio.app/media/activities/stem_rover_demo.jpg",
          "file_type": "image",
          "file_name": "stem_rover_demo.jpg",
          "file_size": 2100000,
          "file_size_display": "2.00 MB",
          "alt_text": "Students testing autonomous rover prototypes",
          "uploaded_by": "admin",
          "create_date": "2026-02-22T10:00:00Z",
          "update_date": "2026-02-22T10:00:00Z"
        },
        "caption": "Students testing autonomous rover prototypes on competition track",
        "order": 1
      },
      {
        "id": 19,
        "image_id": 106,
        "image_details": {
          "id": 106,
          "file": "https://tenant.storio.app/media/activities/stem_award_ceremony.jpg",
          "file_type": "image",
          "file_name": "stem_award_ceremony.jpg",
          "file_size": 1850000,
          "file_size_display": "1.76 MB",
          "alt_text": "Robotics workshop awards presentation",
          "uploaded_by": "admin",
          "create_date": "2026-02-22T14:30:00Z",
          "update_date": "2026-02-22T14:30:00Z"
        },
        "caption": "Awards presentation for top innovation teams",
        "order": 2
      }
    ],
    "featured_image_data": {
      "id": 105,
      "file": "https://tenant.storio.app/media/activities/stem_rover_demo.jpg",
      "file_type": "image",
      "file_name": "stem_rover_demo.jpg",
      "file_size": 2100000,
      "file_size_display": "2.00 MB",
      "alt_text": "Students testing autonomous rover prototypes",
      "uploaded_by": "admin",
      "create_date": "2026-02-22T10:00:00Z",
      "update_date": "2026-02-22T10:00:00Z"
    },
    "seo_title": "Robotics & STEM Workshop 2026 | Storio",
    "seo_description": "Highlights and project showcases from our annual school robotics workshop.",
    "view_count": 512,
    "is_featured": true,
    "categories": [4],
    "categories_data": [
      {
        "id": 4,
        "name": "STEM & Robotics",
        "slug": "stem-robotics",
        "description": "Technology clubs and engineering workshops",
        "parent": null,
        "parent_name": null,
        "activities_count": 6,
        "create_date": "2026-01-15T09:00:00Z",
        "update_date": "2026-01-15T09:00:00Z"
      }
    ],
    "create_date": "2026-02-22T09:30:00Z",
    "update_date": "2026-02-23T11:00:00Z"
  }
  ```

#### 17. `storio.getEvents(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/events/`
- **Method Signature:** `storio.getEvents(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioEvent[] | null>`
- **Description:** Institutional events list with dates, map locations, categories, and event status.
- **Query Parameters Supported:**
  - `status` (`string`): Filter by status (`draft`, `published`, `cancelled`). Defaults to `published`.
  - `categories` (`number`): Filter by category ID.
  - `is_featured` (`boolean`): Filter featured flagship events (`true` / `false`).
  - `search` (`string`): Search across event title, content, and location.
  - `ordering` (`string`): Sort order (e.g. `start_date`, `-start_date`).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 4,
      "title": "Annual Inter-School Science Olympiad 2026",
      "slug": "annual-inter-school-science-olympiad-2026",
      "content": "<p>A 2-day science exhibition, project showcase, and robotics tournament for division schools.</p>",
      "excerpt": "A 2-day science exhibition, project showcase, and robotics tournament for division schools.",
      "location": "Central Auditorium & Science Complex, Main Campus",
      "start_date": "2026-04-10T09:00:00Z",
      "end_date": "2026-04-11T17:00:00Z",
      "status": "published",
      "is_featured": true,
      "featured_image": 28,
      "featured_image_detail": {
        "id": 28,
        "file": "https://tenant.storio.app/media/events/science_olympiad.jpg",
        "file_type": "image",
        "file_name": "science_olympiad.jpg",
        "file_size": 1820000,
        "file_size_display": "1.74 MB",
        "alt_text": "Science Olympiad Main Banner"
      },
      "categories": [1],
      "categories_detail": [
        {
          "id": 1,
          "name": "Science & Innovation",
          "slug": "science-innovation",
          "events_count": 5
        }
      ],
      "view_count": 450,
      "created_at": "2026-02-18T10:05:00Z",
      "updated_at": "2026-02-19T14:20:00Z"
    }
  ]
  ```

#### 18. `storio.getEventDetail(slugOrId, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/events/${slugOrId}/`
- **Method Signature:** `storio.getEventDetail(slugOrId: string | number, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioEvent | null>`
- **Description:** Fetches complete event details by either numeric ID or URL slug string, including full event descriptions, location, start and end dates, category breakdown, and media attachments.
- **Parameters:**
  - `slugOrId` (`string | number`): Unique numeric ID or URL slug string of the event.
  - `tenantHostOrOptions` (`string | StorioFetchOptions`, optional): Target tenant hostname or custom fetch options.
- **Data Payload Obtained:**
  ```json
  {
    "id": 4,
    "title": "Annual Inter-School Science Olympiad 2026",
    "slug": "annual-inter-school-science-olympiad-2026",
    "content": "<p>Join regional schools across the division for a 2-day science exhibition, project showcase, and robotics tournament. Keynote lectures by distinguished university professors will accompany student exhibition booths...</p>",
    "excerpt": "A 2-day science exhibition, project showcase, and robotics tournament for division schools.",
    "location": "Central Auditorium & Science Complex, Main Campus",
    "start_date": "2026-04-10T09:00:00Z",
    "end_date": "2026-04-11T17:00:00Z",
    "status": "published",
    "featured_image": 28,
    "featured_image_detail": {
      "id": 28,
      "file": "https://tenant.storio.app/media/events/science_olympiad.jpg",
      "file_type": "image",
      "file_name": "science_olympiad.jpg",
      "file_size": 1820000,
      "file_size_display": "1.74 MB",
      "alt_text": "Science Olympiad Main Banner",
      "uploaded_by": "admin",
      "create_date": "2026-02-18T10:00:00Z",
      "update_date": "2026-02-18T10:00:00Z"
    },
    "categories": [1],
    "categories_detail": [
      {
        "id": 1,
        "name": "Science & Innovation",
        "slug": "science-innovation",
        "description": "Exhibitions, science fairs, and robotics competitions",
        "events_count": 5,
        "created_at": "2026-01-10T12:00:00Z",
        "updated_at": "2026-01-10T12:00:00Z"
      }
    ],
    "view_count": 450,
    "is_featured": true,
    "seo_title": "Annual Science Olympiad 2026 | Storio",
    "seo_description": "Schedule, venues, and registration guidelines for the 2026 Inter-School Science Olympiad.",
    "created_at": "2026-02-18T10:05:00Z",
    "updated_at": "2026-02-19T14:20:00Z",
    "created_by": 1
  }
  ```

---

### Section 8: Dynamic CMS Custom Builder Pages

#### 19. `storio.getPageBySlug(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/pages/by-slug/${slug}/`
- **Method Signature:** `storio.getPageBySlug(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCustomPage | null>`
- **Description:** Fetches custom dynamic pages constructed via CMS page builder.
- **Data Payload Obtained:**
  ```json
  {
    "id": 45,
    "title": "History & Heritage",
    "slug": "history-and-heritage",
    "content": "<div class="history-timeline"><p>Founded in 1994, our institution began with just 80 pupils and 6 dedicated teachers...</p></div>",
    "meta_title": "Our History & Heritage | Emerald Academy",
    "meta_description": "Learn about the heritage and milestones of Emerald Academy since 1994.",
    "featured_image": "https://tenant.storio.app/media/pages/campus_history.jpg"
  }
  ```

---

### Section 9: Social Proof, Leadership & Promotions

#### 20. `storio.getTestimonials(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/testimonials/`
- **Method Signature:** `storio.getTestimonials(tenantHostOrOptions?: string | StorioFetchOptions): Promise<Record<string, unknown>[] | null>`
- **Description:** Testimonials from parents, alumni, university counselors, and community leaders.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "author_name": "Mrs. Nusrat Jahan",
      "author_title": "Guardian of Grade 10 Scholar",
      "rating": 5,
      "content": "The holistic focus on character, academic rigour, and extracurricular robotics changed my child's outlook entirely.",
      "avatar_url": "https://tenant.storio.app/media/testimonials/guardian_1.jpg",
      "order": 1
    }
  ]
  ```

#### 21. `storio.getLeadershipMessages(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/leadership-messages/`
- **Method Signature:** `storio.getLeadershipMessages(tenantHostOrOptions?: string | StorioFetchOptions): Promise<Record<string, unknown>[] | null>`
- **Description:** Official statements and welcome remarks from the Founder, Chairman, and Principal.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Message from the Principal",
      "author_name": "Prof. Arthur Pendelton",
      "author_role": "Principal & Academic Dean",
      "content": "<p>Welcome to our vibrant academic family where curiosity and integrity guide all endeavors...</p>",
      "photo_url": "https://tenant.storio.app/media/leadership/principal_message.jpg",
      "signature_url": "https://tenant.storio.app/media/leadership/signature_principal.png",
      "order": 1
    }
  ]
  ```

#### 22. `storio.getPromotions(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/promotions/`
- **Method Signature:** `storio.getPromotions(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioPromotion[] | null>`
- **Description:** Active promotion popups, top notification bars, and admission campaign alerts.
- **Query Parameters Supported:**
  - `type` (`string`): Filter by banner type (`top_bar`, `popup_modal`, `floating_card`).
  - `target` (`string`): Target audience (`all`, `students`, `parents`).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Early Bird Admission Discount – Fall 2026",
      "message": "Register before March 31st to waive the institutional registration processing fee.",
      "link": "/admissions/apply",
      "button_text": "Register Now",
      "is_active": true,
      "display_type": "top_bar"
    }
  ]
  ```

---

### Section 10: Quick Links, FAQs, Videos & Exam Results

#### 23. `storio.getImportantLinks(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/important-links/`
- **Method Signature:** `storio.getImportantLinks(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioImportantLink[] | null>`
- **Description:** Curated government, ministerial, and educational resource links.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Ministry of Education Portal",
      "url": "https://moedu.gov.bd",
      "target": "_blank",
      "category": "Government Portals",
      "order": 1
    }
  ]
  ```

#### 24. `storio.getFaqs(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/faqs/`
- **Method Signature:** `storio.getFaqs(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioFaq[] | null>`
- **Description:** Frequently asked questions categorized by admissions, fees, transport, and curriculum.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "question": "What is the age requirement for Nursery admissions?",
      "answer": "<p>Applicants must be 3+ years of age as of January 1st of the academic year.</p>",
      "category": "Admissions",
      "order": 1
    }
  ]
  ```

#### 25. `storio.getVideos(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/reels/`
- **Method Signature:** `storio.getVideos(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioVideoItem[] | null>`
- **Description:** Campus tour reels, YouTube video embeddings, and commencement ceremony recordings.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Campus Virtual Tour 2026",
      "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "thumbnail_url": "https://tenant.storio.app/media/videos/tour_thumb.jpg",
      "duration": "4:15"
    }
  ]
  ```

#### 26. `storio.getCalendarEvents(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/calendar/`
- **Method Signature:** `storio.getCalendarEvents(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCalendarEvent[] | null>`
- **Description:** Institutional academic calendar schedule with term breaks, exam sessions, and holidays.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 10,
      "title": "Spring Mid-Term Recess",
      "start": "2026-03-22",
      "end": "2026-03-29",
      "all_day": true,
      "color": "#10b981",
      "description": "School closed for spring holiday."
    }
  ]
  ```

#### 27. `storio.getExamResults(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/exam-results/`
- **Method Signature:** `storio.getExamResults(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioExamResult[] | null>`
- **Description:** Official published board and institutional examination result sheets.
- **Query Parameters Supported:**
  - `exam_type` (`string`): Filter by exam type (`hsc`, `ssc`, `cambridge_alevel`, `terminal`).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Cambridge A-Level Examination Results 2025",
      "exam_type": "cambridge_alevel",
      "published_date": "2025-08-15",
      "attachment_url": "https://tenant.storio.app/media/results/alevel_2025.pdf"
    }
  ]
  ```

---

### Section 11: Careers & Recruitment

#### 28. `storio.getCareers(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/careers/jobs/`
- **Method Signature:** `storio.getCareers(tenantHostOrOptions?: string | StorioFetchOptions): Promise<Record<string, unknown>[] | null>`
- **Description:** List of active recruitment circulars, job openings, and faculty positions.
- **Query Parameters Supported:**
  - `location` (`string`): Filter by branch or work location.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 5,
      "title": "Senior Mathematics Faculty Member",
      "slug": "senior-mathematics-faculty-member",
      "company_name": "Emerald International Academy",
      "location": "Dhaka, Bangladesh (On-site)",
      "job_type": "full_time",
      "vacancy": 2,
      "deadline": "2026-04-30",
      "status": "active"
    }
  ]
  ```

#### 29. `storio.getJobDetail(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/careers/jobs/${slug}/`
- **Method Signature:** `storio.getJobDetail(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<Record<string, unknown> | null>`
- **Description:** Fetches complete job circular specification for a recruitment opening by slug, including full HTML description, vacancy count, application deadline, submission link, and downloadable circular PDFs.
- **Parameters:**
  - `slug` (`string`): The URL slug identifier of the job opening.
  - `tenantHostOrOptions` (`string | StorioFetchOptions`, optional): Target tenant hostname or custom fetch options.
- **Data Payload Obtained:**
  ```json
  {
    "id": 5,
    "title": "Senior Mathematics Faculty Member",
    "slug": "senior-mathematics-faculty-member",
    "company_name": "Emerald International Academy",
    "location": "Dhaka, Bangladesh (On-site)",
    "job_type": "full_time",
    "vacancy": 2,
    "deadline": "2026-04-30",
    "description": "<p>We are seeking an experienced Mathematics Teacher for Cambridge A-Levels with at least 5 years of teaching experience. Candidates must demonstrate deep pedagogical competence in Pure Mathematics and Statistics.</p>",
    "application_link": "https://recruitment.storio.app/apply/math-2026",
    "status": "active",
    "attachments_data": [
      {
        "id": 88,
        "type": "document",
        "file_name": "job_circular_math_faculty.pdf",
        "url": "https://tenant.storio.app/media/careers/job_circular_math_faculty.pdf",
        "alt_text": "Mathematics Faculty Recruitment Circular PDF"
      }
    ],
    "created_at": "2026-02-12T09:00:00Z",
    "updated_at": "2026-02-14T11:30:00Z"
  }
  ```

---

### Section 12: National Education Board Notice Sync

#### 30. `storio.getBoardNotices(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/board-notices/`
- **Method Signature:** `storio.getBoardNotices(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioBoardNotice[] | null>`
- **Description:** Automated live notice feed synchronized with national and regional Education Boards (e.g. Dhaka Board, BISE, Cambridge International).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "SSC & Dakhil Examination Center Relocation Notice",
      "publish_date": "2026-02-24",
      "board_name": "Dhaka Education Board",
      "pdf_url": "https://dhakaeducationboard.gov.bd/notices/center_relocation.pdf"
    }
  ]
  ```

---

### Section 13: Online Admission Portal & Interactive Forms

#### 31. `storio.getAdmissionFormConfig(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/admission/form-config/current/`
- **Method Signature:** `storio.getAdmissionFormConfig(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionFormConfig | null>`
- **Description:** Active admission intake configuration, eligibility criteria, and dynamic form schema.
- **Data Payload Obtained:**
  ```json
  {
    "id": 1,
    "title": "Fall 2026 Admissions Intake",
    "is_active": true,
    "start_date": "2026-01-01",
    "end_date": "2026-05-31",
    "guidelines_html": "<p>Please ensure all previous grade transcripts are uploaded in PDF format.</p>",
    "application_fee": 1500,
    "fields": [
      { "name": "student_name", "label": "Full Name of Student", "type": "text", "required": true },
      { "name": "dob", "label": "Date of Birth", "type": "date", "required": true },
      { "name": "applying_for_grade", "label": "Grade Applying For", "type": "select", "required": true, "options": ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "A-Levels"] }
    ]
  }
  ```

#### 32. `storio.sendAdmissionOTP(email, phone?, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/admission/send-otp/`
- **Method Signature:** `storio.sendAdmissionOTP(email: string, phone?: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionOTPResponse | null>`
- **Description:** Dispatches a 6-digit verification code to the applicant's email address or mobile number.
- **Payload Sent:** `{ "email": "applicant@example.com", "phone": "+8801711000000" }`
- **Data Returned:**
  ```json
  {
    "success": true,
    "message": "OTP verification code sent to your email and phone."
  }
  ```

#### 33. `storio.verifyAdmissionOTP(email, otpCode, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/admission/verify-otp/`
- **Method Signature:** `storio.verifyAdmissionOTP(email: string, otpCode: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionOTPResponse | null>`
- **Description:** Validates the applicant's entered OTP code prior to allowing final form submission.
- **Payload Sent:** `{ "email": "applicant@example.com", "otp_code": "482910" }`
- **Data Returned:**
  ```json
  {
    "success": true,
    "message": "OTP verified successfully."
  }
  ```

#### 34. `storio.submitAdmissionApplication(formData, otpCode, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/admission/applications/`
- **Method Signature:** `storio.submitAdmissionApplication(formData: Record<string, unknown>, otpCode: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionApplicationResponse | null>`
- **Description:** Submits the completed admission application payload to the tenant database.
- **Payload Sent:**
  ```json
  {
    "form_data": {
      "student_name": "Zara Rahman",
      "dob": "2010-06-15",
      "applying_for_grade": "Grade 9"
    },
    "otp_code": "482910"
  }
  ```
- **Data Returned:**
  ```json
  {
    "success": true,
    "application_number": "APP-2026-00421",
    "message": "Application submitted successfully! Please check your email for payment instructions."
  }
  ```

#### 35. `storio.submitContactMessage(formData, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/contact/`
- **Headers Required:** `Content-Type: application/json`, `x-tenant-host: <tenant-domain>` (injected automatically by SDK)
- **Method Signature:** `storio.submitContactMessage(formData: Record<string, unknown>, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioContactFormResponse | null>`
- **Description:** Submits public contact messages and inquiry requests from the template contact page directly into the tenant admin mailbox.
- **Payload Sent:**
  ```json
  {
    "name": "Mahmudul Hasan",
    "email": "student@example.com",
    "mobile": "+8801700000000",
    "subject": "Inquiry regarding lab facilities",
    "message": "Testing contact message endpoint...",
    "recaptcha_token": "10000000-aaaa-bbbb-cccc-000000000001"
  }
  ```
  > `recaptcha_token` is **optional**. Pass `null` or omit entirely if your template design does not implement captcha.
- **Success Response (`201 Created` — Real Live Response):**
  ```json
  {
    "success": true,
    "message": "Thank you for contacting us! We will get back to you soon."
  }
  ```
- **Validation Error Response (`400 Bad Request` — Real Live Response):**
  ```json
  {
    "email": ["Enter a valid email address."]
  }
  ```

#### hCaptcha Integration Instructions for 3rd-Party Template Developers

> **Architecture Overview:** Bot protection on `/api/v2/template/contact/` uses hCaptcha.
> - **Zero Secret Key Exposure:** Third-party developers never need or handle the secret key. Verification occurs server-to-server on the backend.
> - **Dynamic Public Site Key:** Retrieve the site key dynamically from `storio.getSettings(tenantHost)` &rarr; `settings?.hcaptcha_site_key`.
> - **Optional:** If your custom template omits captcha, simply send `recaptcha_token: null` or omit the field. The backend processes the message without blocking.

**1. Install the hCaptcha React Component:**
```bash
npm install @hcaptcha/react-hcaptcha
```

**2. Local Development & Testing Bypass:**
During local development (`localhost`), you do not need to solve interactive challenges:
- **Test Site Key:** `10000000-ffff-ffff-ffff-000000000001`
- **Auto-generated Test Token:** `10000000-aaaa-bbbb-cccc-000000000001` (backend automatically accepts this token on development/preview instances).

**3. Resolve Site Key in Your Component / Page:**
```typescript
const settings = await storio.getSettings(tenantHost);
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const siteKey = settings?.hcaptcha_site_key || (isLocal ? '10000000-ffff-ffff-ffff-000000000001' : null);
```

**4. Form Submission Pattern:**
```typescript
const payload = {
  name: formData.get('name'),
  email: formData.get('email'),
  mobile: formData.get('mobile'),
  subject: formData.get('subject'),
  message: formData.get('message'),
  recaptcha_token: captchaToken || null, // from <HCaptcha onVerify={(token) => setCaptchaToken(token)} />
};

const res = await storio.submitContactMessage(payload, tenantHost);
```

---

### Section 14: Academics

#### 36. `storio.getClassRoutines(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/academic/class-routines/`
- **Method Signature:** `storio.getClassRoutines(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioClassRoutine[] | null>`
- **Description:** Retrieves weekly class routines, period schedules, and downloadable timetable documents.
- **Query Parameters Supported:**
  - `class_name` (`string`): Filter by class or grade (e.g. `Class 9`, `Class 10`).
  - `section` (`string`): Filter by section (e.g. `Section A`, `Section B`).
  - `shift` (`string`): Filter by shift (`Morning`, `Day`).
  - `year` (`number`): Academic year filter (`2026`).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "class_name": "Class 10",
      "section": "A",
      "shift": "Morning",
      "academic_year": 2026,
      "routine_file": "https://tenant.storio.app/media/routines/class_10_a_routine.pdf",
      "schedule_json": {
        "days": [
          {
            "day": "Sunday",
            "periods": [
              { "period": 1, "time": "08:00 AM - 08:45 AM", "subject": "Higher Mathematics", "teacher": "Dr. E. Vance", "room": "Room 302" },
              { "period": 2, "time": "08:45 AM - 09:30 AM", "subject": "Physics Lab", "teacher": "Prof. A. Pendelton", "room": "Lab 2" }
            ]
          }
        ]
      }
    }
  ]
  ```

#### 37. `storio.getSyllabuses(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/academic/syllabuses/`
- **Method Signature:** `storio.getSyllabuses(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioSyllabus[] | null>`
- **Description:** Term syllabuses, learning outcomes, curriculum overviews, and downloadable PDF course packs.
- **Query Parameters Supported:**
  - `class_name` (`string`): Filter by class name.
  - `exam_type` (`string`): Filter by exam term (`Midterm`, `Final`, `Pre-Test`).
  - `year` (`number`): Filter by academic year.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 3,
      "class_name": "Class 9",
      "academic_year": 2026,
      "exam_type": "Final Examination",
      "description": "Comprehensive term syllabus including English Literature, General Science, and Pure Math.",
      "file_url": "https://tenant.storio.app/media/syllabuses/class_9_final_syllabus.pdf"
    }
  ]
  ```

#### 38. `storio.getStudentStats(params?, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/student-stats/`
- **Method Signature:** `storio.getStudentStats(params?: { year?: number | string; program?: string }, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioStudentStatsResponse | null>`
- **Description:** Institutional student demographics, gender breakdown, group distributions (Science, Commerce, Arts), program categories (e.g., General, Vocational), and grand enrollment totals for accreditation dashboards.
- **Query Parameters Supported:**
  - `year` (`number` | `string`): Specific academic year (e.g., `2026`). Defaults to latest present in database.
  - `program` (`string`): Filter by academic program name (e.g., `General`, `Vocational`).
- **Data Payload Obtained:**
  ```json
  {
    "academic_year": 2026,
    "grand_total_male": 1280,
    "grand_total_female": 1340,
    "grand_total": 2620,
    "total_sections": 18,
    "classes": [
      {
        "id": 101,
        "academic_year": 2026,
        "year": 2026,
        "class_name": "Class 10",
        "class_name_en": "Class Ten",
        "program": "General",
        "shift": "Morning",
        "order": 1,
        "total_male": 140,
        "total_female": 150,
        "total_students": 290,
        "groups": [
          { "group_name": "Science", "sections": ["A", "B"], "total_male": 90, "total_female": 95, "total_students": 185 },
          { "group_name": "Commerce", "sections": ["C"], "total_male": 30, "total_female": 35, "total_students": 65 },
          { "group_name": "Humanities", "sections": ["D"], "total_male": 20, "total_female": 20, "total_students": 40 }
        ]
      }
    ]
  }
  ```
- **Example Usage:**
  ```typescript
  // Fetch stats for default/current academic year
  const stats = await storio.getStudentStats();

  // Fetch stats filtered by year and program
  const vocationalStats = await storio.getStudentStats({ year: 2026, program: 'Vocational' });
  ```

#### 39. `storio.getAcademicPrograms(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/academic/programs/`
- **Method Signature:** `storio.getAcademicPrograms(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAcademicProgram[]>`
- **Description:** Returns the list of academic programs configured for the institution, including both custom programs and standard curriculum programs. Each program includes the list of associated class names. Returns an empty array `[]` if no programs are configured.
- **Query Parameters:** None.
- **Data Payload Obtained (verified live response from `diu.storio.cloud`):**
  ```json
  [
    {
      "id": 8,
      "name": "Testing",
      "classes": ["12", "sdsdsa"],
      "is_custom": true
    },
    {
      "id": null,
      "name": "Pre-Primary",
      "classes": ["Play", "Nursery", "KG", "Pre-Primary", "Class 10"],
      "is_custom": false
    },
    {
      "id": null,
      "name": "Madrasa",
      "classes": [
        "Ebtedayee 1", "Ebtedayee 2", "Ebtedayee 3", "Ebtedayee 4", "Ebtedayee 5",
        "Dakhil 6", "Dakhil 7", "Dakhil 8", "Dakhil 9", "Dakhil 10",
        "Alim 1st Year", "Alim 2nd Year"
      ],
      "is_custom": false
    },
    {
      "id": null,
      "name": "THOR",
      "classes": ["10"],
      "is_custom": false
    }
  ]
  ```
  > **Note:** `id` is `null` for standard (system-defined) programs and a positive integer for custom programs added by the tenant admin. `is_custom: true` programs are institution-specific overrides.
- **Example Usage:**
  ```typescript
  const programs = await storio.getAcademicPrograms(tenantHost);
  // Always returns an array — empty [] if none configured

  programs.forEach((program) => {
    console.log(program.name, program.classes);
  });
  ```
- **TypeScript Interface:** `StorioAcademicProgram` (see Section 4).

---

### Section 15: Citizen Charter & Institutional Compliance

#### 40. `storio.getMpoInfo(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/mpo-info/`
- **Method Signature:** `storio.getMpoInfo(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioMpoInfo | null>`
- **Description:** Official government Monthly Pay Order (MPO) compliance details, committee approval resolutions, and institutional gazette certificates.
- **Data Payload Obtained:**
  ```json
  {
    "mpo_code": "MPO-883192",
    "recognition_date": "2004-07-01",
    "managing_committee_status": "Approved by Regional Board",
    "committee_approved_date": "2024-03-10",
    "committee_expire_date": "2027-03-09",
    "documents": [
      {
        "id": 1,
        "title": "Government Gazette Gazette Recognition Order",
        "document_type": "order",
        "file_url": "https://tenant.storio.app/media/compliance/mpo_order.pdf",
        "uploaded_at": "2024-03-15T08:00:00Z"
      }
    ]
  }
  ```

#### 41. `storio.getInformationService(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/information-service/`
- **Method Signature:** `storio.getInformationService(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioInformationService | null>`
- **Description:** Right to Information (RTI) designated officer profiles, appeals authority contact details, and citizen service procedures.
- **Data Payload Obtained:**
  ```json
  {
    "officer_name": "Mohammad Rafiqul Islam",
    "designation": "Assistant Headmaster & Designated RTI Officer",
    "phone": "+880 1711-445566",
    "email": "rti@emeraldacademy.edu",
    "room_no": "Administrative Building, Room 104",
    "photo_url": "https://tenant.storio.app/media/staff/rti_officer.jpg",
    "guidelines": "<p>Citizens may submit RTI queries using Form A available at the reception desk.</p>",
    "appeals_authority_name": "Prof. Arthur Pendelton",
    "appeals_authority_designation": "Principal & Chairman of Appeals",
    "appeals_authority_phone": "+880 1711-111111",
    "appeals_authority_email": "principal@emeraldacademy.edu"
  }
  ```

#### 42. `storio.getComplaintOfficer(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/complaint-officer/`
- **Method Signature:** `storio.getComplaintOfficer(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioComplaintOfficer | null>`
- **Description:** Grievance Redress System (GRS) compliance officer profile, formal grievance escalation steps, and appeal workflows.
- **Data Payload Obtained:**
  ```json
  {
    "officer_name": "Begum Rashida Khatun",
    "designation": "Senior Counselor & Designated Grievance Officer",
    "phone": "+880 1711-778899",
    "email": "grievance@emeraldacademy.edu",
    "room_no": "Student Welfare Annex, Room 201",
    "photo_url": "https://tenant.storio.app/media/staff/grs_officer.jpg",
    "steps": [
      { "step_number": 1, "title": "Submission of Written Grievance", "description": "Lodge formal report via portal or drop-box." },
      { "step_number": 2, "title": "Preliminary Review", "description": "Investigation begins within 3 working days." },
      { "step_number": 3, "title": "Resolution & Notification", "description": "Official finding delivered within 14 working days." }
    ]
  }
  ```

#### 43. `storio.getHotlines(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/hotlines/`
- **Method Signature:** `storio.getHotlines(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioHotline[] | null>`
- **Description:** Government, legal, and public safety emergency hotlines (e.g. 999 National Emergency, 1098 Child Helpline, 333 Government Services).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "National Emergency Service",
      "number": "999",
      "category": "emergency",
      "is_active": true,
      "order": 1
    },
    {
      "id": 2,
      "title": "Child Helpline",
      "number": "1098",
      "category": "child_helpline",
      "is_active": true,
      "order": 2
    },
    {
      "id": 3,
      "title": "National Information & Citizen Services",
      "number": "333",
      "category": "govt_service",
      "is_active": true,
      "order": 3
    }
  ]
  ```

---

### Section 16: Core API Fetcher (`apiFetch`)

#### 44. `storio.apiFetch<T>(endpoint, options?)`
- **Signature:** `apiFetch<T>(endpoint: string, options?: StorioFetchOptions): Promise<T | null>`
- **Description:** Low-level, generic fetch wrapper used internally by all SDK methods. Use this if you need to fetch a custom endpoint or send specialized HTTP headers not covered by built-in methods.

---

## 4. Complete TypeScript Type Interfaces

Here are all 46 TypeScript interfaces exported directly by `@storio/template-sdk`:

```typescript
export interface StorioFetchOptions extends RequestInit {
  tenantHost?: string;
  backendBaseUrl?: string;
  next?: { revalidate?: number | false; tags?: string[] };
}

export interface StorioSocialLink {
  platform: string;
  url: string;
}

export interface StorioSettingsResponse {
  site_title?: string;
  site_tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  contact_email?: string;
  phone_number?: string;
  social_links?: StorioSocialLink[];
  mailing_address?: string;
  hcaptcha_site_key?: string;
}

export interface StorioCustomizationResponse {
  config: Record<string, string | number | boolean | unknown>;
}

export interface StorioNavigationItem {
  id?: string | number;
  label: string;
  url: string;
  target?: string;
  children?: StorioNavigationItem[];
}

export interface StorioNavigationResponse {
  items: StorioNavigationItem[];
}

export interface RecognitionDocument {
  id: number;
  title: string;
  document_file?: string;
  file_url?: string;
  uploaded_at: string;
}

export interface AcademicRecognition {
  id: number;
  title: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date?: string | null;
  is_lifetime: boolean;
  description?: string;
  documents?: RecognitionDocument[];
}

export interface StorioInstitutionProfile {
  id?: number;
  name?: string;
  short_name?: string;
  eiin?: string;
  institute_code?: string;
  established_year?: number;
  motto?: string;
  email?: string;
  phone?: string;
  address?: string;
  about_text?: string;
  recognitions?: AcademicRecognition[];
}

export interface StorioLayoutResponse {
  settings?: StorioSettingsResponse;
  customization?: StorioCustomizationResponse;
  navigation?: StorioNavigationResponse;
}

export interface StorioHeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_url?: string;
  order?: number;
}

export interface StorioNotice {
  id: number;
  title: string;
  slug?: string;
  content?: string;
  published_date?: string;
  is_urgent?: boolean;
  attachment_url?: string;
}

export interface StorioBlogPost {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  featured_image_url?: string;
  category_name?: string;
  published_at?: string;
}

export interface StorioStaffMember {
  id: number;
  name: string;
  designation: string;
  department?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  qualification?: string;
  order?: number;
}

export interface StorioTeamMember {
  id: number;
  name: string;
  role: string;
  designation?: string;
  bio?: string;
  photo_url?: string;
  section?: string;
  order?: number;
}

export interface StorioGalleryItem {
  id: number;
  title: string;
  image_url: string;
  thumbnail_url?: string;
  album_id?: number;
  album_title?: string;
  created_at?: string;
}

export interface StorioAlbum {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  total_photos?: number;
}

export interface StorioActivityItem {
  id: number;
  title: string;
  slug?: string;
  summary?: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  image?: string;
  published_at?: string;
  date?: string;
}

export interface StorioEvent {
  id: number;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  is_featured?: boolean;
  featured_image?: string | number;
  featured_image_detail?: {
    id?: number;
    url?: string;
    file?: string;
    fileName?: string;
  };
  categories?: number[];
  categories_detail?: Array<{
    id?: number;
    name?: string;
    slug?: string;
    events_count?: number;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface StorioCustomPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
}

export interface StorioAdmissionField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface StorioAdmissionFormConfig {
  id: number;
  title: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  guidelines_html?: string;
  application_fee?: number;
  fields: StorioAdmissionField[];
}

export interface StorioAdmissionOTPResponse {
  success: boolean;
  message?: string;
}

export interface StorioAdmissionApplicationResponse {
  success: boolean;
  application_number?: string;
  message?: string;
}

export interface StorioContactFormResponse {
  success: boolean;
  message?: string;
}

export interface StorioImportantLink {
  id: number;
  title: string;
  url: string;
  target?: string;
  category?: string;
  order?: number;
}

export interface StorioBoardNotice {
  id: number;
  title: string;
  publish_date: string;
  board_name?: string;
  pdf_url?: string;
}

export interface StorioPromotion {
  id: number;
  title: string;
  message?: string;
  link?: string;
  button_text?: string;
  is_active: boolean;
  display_type?: string;
}

export interface StorioFaq {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface StorioVideoItem {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
}

export interface StorioCalendarEvent {
  id: number;
  title: string;
  start: string;
  end?: string;
  all_day?: boolean;
  color?: string;
  description?: string;
}

export interface StorioExamResult {
  id: number;
  title: string;
  exam_type: string;
  published_date: string;
  attachment_url?: string;
}

export interface StorioClassRoutineScheduleItem {
  period: number;
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
}

export interface StorioClassRoutineDaySchedule {
  day: string;
  periods: StorioClassRoutineScheduleItem[];
}

export interface StorioClassRoutine {
  id: number;
  class_name: string;
  section?: string;
  shift?: string;
  academic_year: number;
  routine_file?: string;
  schedule_json?: {
    days?: StorioClassRoutineDaySchedule[];
  };
}

export interface StorioSyllabus {
  id: number;
  class_name: string;
  academic_year: number;
  exam_type: string;
  description?: string;
  file_url?: string;
}

export interface StorioStudentGroupStat {
  group_name: string;
  sections?: string[];
  total_male?: number;
  total_female?: number;
  total_students?: number;
}

export interface StorioStudentStat {
  id: number;
  academic_year: number;
  year?: number;
  class_name: string;
  class_name_en?: string;
  program?: string;
  groups?: StorioStudentGroupStat[];
  total_male?: number;
  total_female?: number;
  total_students?: number;
  shift?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StorioStudentStatsResponse {
  academic_year: number;
  grand_total_male: number;
  grand_total_female: number;
  grand_total: number;
  total_sections: number;
  classes: StorioStudentStat[];
}

export interface StorioAcademicProgram {
  id: number | null;
  name: string;
  classes: string[];
  is_custom: boolean;
}

export interface StorioMpoDocument {
  id: number;
  title: string;
  document_type: string;
  file_url?: string;
  uploaded_at: string;
}

export interface StorioMpoInfo {
  mpo_code?: string;
  recognition_date?: string;
  managing_committee_status?: string;
  committee_approved_date?: string;
  committee_expire_date?: string;
  documents?: StorioMpoDocument[];
}

export interface StorioInformationService {
  officer_name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  room_no?: string;
  photo_url?: string;
  guidelines?: string;
  appeals_authority_name?: string;
  appeals_authority_designation?: string;
  appeals_authority_phone?: string;
  appeals_authority_email?: string;
}

export interface StorioComplaintStep {
  step_number: number;
  title: string;
  description: string;
}

export interface StorioComplaintOfficer {
  officer_name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  room_no?: string;
  photo_url?: string;
  steps?: StorioComplaintStep[];
}

export interface StorioHotline {
  id: number;
  title: string;
  number: string;
  category: string;
  is_active: boolean;
  order: number;
}
```

---

## 5. Architectural Best Practices & Error Handling

1. **Parallel Server Fetching:** Always fetch independent layout, navigation, and section data in parallel via `Promise.all` to minimize Time to First Byte (TTFB):
   ```typescript
   const [layout, notices, events] = await Promise.all([
     storio.getLayout(tenantHost),
     storio.getNotices(tenantHost),
     storio.getEvents(tenantHost),
   ]);
   ```
2. **Next.js Revalidation Strategy:** Configure appropriate ISR revalidation windows via the `next` options object:
   ```typescript
   // Rarely changing data (institution profile): revalidate daily
   const profile = await storio.getInstitutionProfile({ tenantHost, next: { revalidate: 86400 } });

   // Never cache settings or customization for long: admins expect a published Theme settings
   // change to show at once. (The starter kit renders every request fresh.)

   // High-velocity data (notices, blogs): revalidate every 60 seconds
   const notices = await storio.getNotices({ tenantHost, next: { revalidate: 60 } });
   ```
3. **Graceful Degradation:** The SDK never throws uncaught exceptions on network errors; it returns `null` or empty collections and logs informative warnings in development. Always write clean null-check fallbacks.

---

## 6. Using the SDK in the Starter Kit (Examples)

Every public page in the starter kit has two files. Follow the same pattern:

| File | Runs on | Does |
| :--- | :--- | :--- |
| `src/app/(site)/<route>/page.tsx` | server | loads the school's data with the SDK (through a loader in `src/lib/`) and the page metadata |
| `src/components/views/<Name>View.tsx` | client | renders it; the page's static texts are editable page content (`<CmsSection>`, `<CmsField>`) |

SDK data is the school's own data: render it as it is, without `<CmsField>`. The exceptions are the record fields the editor may change (Example 2).

The working versions of these examples are in the starter kit: `src/app/(site)/notices/`, `src/components/views/NoticesView.tsx`, `NoticeDetailView.tsx` and `ContactView.tsx`.

### Example 1: A list page with editable texts

```tsx
// src/app/(site)/notices/page.tsx (server)
import type { Metadata } from 'next';
import { NoticesView } from '@/components/views/NoticesView';
import { pageMetadata } from '@/lib/seo';
import { loadNotices } from '@/lib/notices';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-notices');
}

export default async function NoticesPage() {
  const notices = await loadNotices(await resolveTenant()); // SDK + Rule 1
  return <NoticesView notices={notices} />;
}
```

```tsx
// src/components/views/NoticesView.tsx (client)
'use client';

import type { StorioNotice } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';
import { useNoticesText } from '@/components/cms/useNoticesText';

export function NoticesView({ notices }: { notices: StorioNotice[] }) {
  const { intro } = useNoticesText(); // the page's editable texts

  return (
    <CmsSection sectionKey="intro" title="Notice board" page="template-0-starter-notices">
      <h1><CmsField path="title" label="Title">{intro.title}</CmsField></h1>
      {notices.length === 0 ? (
        // Rule 1: a real school with no notices gets an empty state, never demo data
        <p><CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField></p>
      ) : (
        <ul>
          {notices.map((notice) => (
            <li key={notice.id}>
              {/* a record field: the editor may change a notice's title (Example 2) */}
              <CmsField collection="notice" item={String(notice.id)} path="title">{notice.title}</CmsField>
              {/* plain SDK data: no pencil */}
              {notice.published_date && <span>{notice.published_date}</span>}
            </li>
          ))}
        </ul>
      )}
    </CmsSection>
  );
}
```

### Example 2: A record detail page

A notice, blog post or event detail page loads one record with the SDK. The editor may change a few fields of that record (saving the record itself):

| Record | URL holds | Editable fields |
| :--- | :--- | :--- |
| notice (`collection="notice"`) | its id | `title` |
| blog post (`collection="blog"`) | its slug | `title`, `excerpt` |
| event (`collection="event"`) | its slug | `title`, `excerpt`, `location` |

```tsx
// src/app/(site)/events/[slug]/page.tsx (server)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventView } from '@/components/views/EventView';
import { loadEvent } from '@/lib/events'; // your loader: storio.getEventDetail + withDemoRecord
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata({ params }: PageProps<'/events/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug, await resolveTenant());
  return event ? { title: event.title, description: event.excerpt } : {};
}

export default async function EventPage({ params }: PageProps<'/events/[slug]'>) {
  const { slug } = await params;
  const event = await loadEvent(slug, await resolveTenant());
  if (!event?.slug) notFound();
  return <EventView event={event} />;
}
```

```tsx
// in EventView (client); `event.slug` is the record id the editor uses
<h1><CmsField collection="event" item={event.slug} path="title">{event.title}</CmsField></h1>
<p><CmsField collection="event" item={event.slug} path="excerpt">{event.excerpt}</CmsField></p>
<p><CmsField collection="event" item={event.slug} path="location">{event.location}</CmsField></p>
{/* the body is rich text from the school: never wrap it */}
<div dangerouslySetInnerHTML={{ __html: event.content ?? '' }} />
```

List the page in the manifest's `editorPages` with `"route": "/events/[slug]"` and `"collection": "event"` (see the [Editor Template Guide](./Storio_Editor_Template_Guide.md), section 8). `useCollectionItem` shows the editor's unsaved values live (see `NoticeDetailView.tsx`).

> **Blog posts:** the API returns the short text as `excerpt`, but the SDK's `StorioBlogPost` type still calls it `summary`. Until the type is fixed, read it as `(post as StorioBlogPost & { excerpt?: string }).excerpt`.

### Example 3: A form (Server Action)

Forms send data to the school with the SDK from a Server Action, so the school's host is resolved on the server:

```tsx
// src/app/(site)/contact/actions.ts
'use server';

import { storio } from '@storio/template-sdk';
import { resolveTenant } from '@/lib/tenant';

export interface ContactFormState {
  status: 'idle' | 'success' | 'error';
}

export async function sendContactMessage(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  if (!name || !email || !message) return { status: 'error' };

  const { tenantHost, isStandalone } = await resolveTenant();
  if (isStandalone) return { status: 'success' }; // Standalone Preview: nothing is sent

  const result = await storio.submitContactMessage({ name, email, message }, tenantHost);
  return { status: result?.success ? 'success' : 'error' };
}
```

The form's labels, button text and success/error messages are editable page content (see `ContactView.tsx`). If the school uses hCaptcha, `getSettings()` returns its `hcaptcha_site_key`; send the token as `recaptcha_token`.
