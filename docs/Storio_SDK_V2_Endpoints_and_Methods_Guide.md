# Storio Template SDK (v2) — Comprehensive Developer API & Data Reference Manual

> **Last Updated:** October 13, 2026 | **SDK Version:** `@storio/template-sdk@1.0.1` | **Platform:** Storio CMS v2

Welcome 3rd-party template developers! 

This is the **complete, official API and Data Payload reference manual** for `@storio/template-sdk` (bundled in your starter template under `packages/storio-template-sdk-1.0.1.tgz`).

Every single SDK method, backend V2 endpoint path, method signature, parameter, TypeScript type interface, and exact JSON data payload structure from `packages/template-sdk/src/index.ts` is documented below.

---

## Table of Contents

- [1. Quick Start & Setup](#1-quick-start--setup)
  - [Importing the SDK](#importing-the-sdk)
  - [Key SDK Capabilities](#key-sdk-capabilities)
  - [Fetching Live Database Data with Storio CLI](#fetching-live-database-data-with-storio-cli)
  - [Mandatory Rules for Template Developers](#mandatory-rules-for-template-developers)
    - [Rule 1: Tenant DB vs. Standalone Preview Mock Data Rule](#rule-1-tenant-db-vs-standalone-preview-mock-data-rule)
    - [Rule 2: Strict Typing Rule (No any Types Allowed)](#rule-2-strict-typing-rule-no-any-types-allowed)
- [2. Complete SDK Method & Endpoint Index (43 Methods)](#2-complete-sdk-method--endpoint-index-43-methods)
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
  - [Section 14: Academics (Class Routines, Syllabuses, Student Stats) (Methods 36–38)](#section-14-academics)
  - [Section 15: Citizen Charter & Institutional Compliance (Methods 39–42)](#section-15-citizen-charter--institutional-compliance)
  - [Section 16: Core API Fetcher (Method 43)](#section-16-core-api-fetcher-apifetch)
- [4. Complete TypeScript Type Interfaces (45 Interfaces)](#4-complete-typescript-type-interfaces)
- [5. Architectural Best Practices & Error Handling](#5-architectural-best-practices--error-handling)
- [6. Next.js App Router Implementation Guide & Examples](#6-nextjs-app-router-implementation-guide--examples)
  - [Example 1: Complete Server Homepage (`src/app/page.tsx`)](#example-1-complete-server-homepage-srcapppagetsx)
  - [Example 2: Dynamic Blog Detail Server Page (`src/app/blog/[slug]/page.tsx`)](#example-2-dynamic-blog-detail-server-page-srcappblogslugpagetsx)
  - [Example 3: Client Form Submission Component (`src/components/ContactForm.tsx`)](#example-3-client-form-submission-component-srccomponentscontactformtsx)
  - [Example 4: Academics Routine & Syllabus Page (`src/app/academics/page.tsx`)](#example-4-academics-routine--syllabus-page-srcappacademicspagetsx)
  - [Example 5: Citizen Charter & Compliance Page (`src/app/compliance/page.tsx`)](#example-5-citizen-charter--compliance-page-srcappcompliancepagetsx)

---

## 1. Quick Start & Setup

### Importing the SDK

Install the `@storio/template-sdk` package in your template repository:

```bash
npm install @storio/template-sdk
```

Import the singleton instance `storio` or specific TypeScript models anywhere in your server or client components:

```typescript
import { storio, StorioLayoutResponse, StorioNotice, StorioBlogPost } from '@storio/template-sdk';
```

### Key SDK Capabilities

- **Automatic Multi-Tenant Resolution:** Detects tenant context automatically from `NEXT_PUBLIC_STORIO_TENANT_HOST` or incoming HTTP request headers (`x-tenant-host`, `host`).
- **Edge & Next.js ISR/SSR Ready:** Built on native web standards (`fetch`), allowing seamless use inside Server Components, Server Actions, Route Handlers, and Edge Middleware with full Next.js cache revalidation support (`next: { revalidate: 60 }`).
- **Comprehensive Backend Coverage:** 43 specialized methods covering layout, navigation, notices, blogs, staff, events, admissions, academics, and regulatory compliance.
- **Fail-Safe Typing:** Fully written in strict TypeScript with zero implicit `any` types.

---

### Fetching Live Database Data with Storio CLI

Template developers can connect their local preview environment to live production or development tenant databases using the official Storio CLI tool.

#### 1. Authenticate with Storio
```bash
# Connect to production cloud:
storio login
```

#### 2. Link Template to a Tenant Database
```bash
# Select from accessible cloud tenants:
storio link
```
*This command writes `NEXT_PUBLIC_STORIO_TENANT_HOST=<tenant-host>` directly to your `.env.local` file.*

#### 3. Launch Development Server with Live Database Data
```bash
# Automatically injects linked tenant context and starts Next.js:
storio dev
```

#### 4. Disconnect & Return to Mock Data
```bash
storio unlink
```

---

### Mandatory Rules for Template Developers

#### Rule 1: Tenant DB vs. Standalone Preview Mock Data Rule

When a customer installs a template into their live tenant, the database starts empty or contains only their populated records. 

> [!IMPORTANT]
> **The Golden Data Fallback Rule:**
> 1. When running on a live tenant domain (or when linked via `storio link` / `NEXT_PUBLIC_STORIO_TENANT_HOST`), the template **MUST render actual database data**. If a database table is empty (e.g. 0 notices, 0 blogs), render a clean empty state or gracefully hide the section. **NEVER fallback to mock demo data in live tenant mode.**
> 2. When running in unlinked local preview mode (`localhost` without `NEXT_PUBLIC_STORIO_TENANT_HOST`), the template **MUST fallback to default demo data** so prospective buyers can preview the template design.

#### Golden Code Pattern for Data Fetching:

```typescript
import { headers } from 'next/headers';
import { storio, StorioLayoutResponse, StorioNotice } from '@storio/template-sdk';
import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';

export default async function Page() {
  // 1. Resolve Host from Next.js Headers
  const headersList = await headers();
  const rawHost = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host = rawHost.split(':')[0];

  // 2. Determine Mode
  const linkedTenant = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isStandalone = isLocalHost && !linkedTenant;
  const tenantHost = linkedTenant || (isStandalone ? 'demo.storio.cloud' : host);

  // 3. Fetch Real Tenant Data via SDK
  const [rawLayout, rawNotices] = await Promise.all([
    storio.getLayout(tenantHost),
    storio.getNotices(tenantHost),
  ]);

  // 4. Apply the Golden Rule
  const layout: StorioLayoutResponse | null = rawLayout || (isStandalone ? DEFAULT_DEMO_DATA.layout : null);
  const notices: StorioNotice[] = (Array.isArray(rawNotices) && rawNotices.length > 0)
    ? rawNotices
    : (isStandalone ? DEFAULT_DEMO_DATA.notices : []);

  return (
    <main>
      <h1>{layout?.settings?.site_title || "Campus Portal"}</h1>
      {notices.length > 0 ? (
        <ul>{notices.map(n => <li key={n.id}>{n.title}</li>)}</ul>
      ) : (
        <p>No notices currently published.</p>
      )}
    </main>
  );
}
```

### Rule 2: Strict Typing Rule (No `any` Types Allowed)
Every component, utility, and state hook must use the exported TypeScript interfaces provided by `@storio/template-sdk`. The use of `any`, `unknown` casts without guards, or loose objects is strictly prohibited.

---

## 2. Complete SDK Method & Endpoint Index (43 Methods)

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
| 35 | `storio.submitContactMessage(formData, host?)` | `POST` | `/api/v2/template/contact/` | Body: `{ name, email, subject, message }` | `Promise<StorioContactFormResponse \| null>` |
| 36 | `storio.getClassRoutines(host?)` | `GET` | `/api/v2/template/academic/class-routines/` | `class_name`, `section`, `shift`, `year` | `Promise<StorioClassRoutine[] \| null>` |
| 37 | `storio.getSyllabuses(host?)` | `GET` | `/api/v2/template/academic/syllabuses/` | `class_name`, `exam_type`, `year` | `Promise<StorioSyllabus[] \| null>` |
| 38 | `storio.getStudentStats(params?, host?)` | `GET` | `/api/v2/template/student-stats/` | `year`, `program` | `Promise<StorioStudentStatsResponse \| null>` |
| 39 | `storio.getMpoInfo(host?)` | `GET` | `/api/v2/template/mpo-info/` | None | `Promise<StorioMpoInfo \| null>` |
| 40 | `storio.getInformationService(host?)` | `GET` | `/api/v2/template/information-service/` | None | `Promise<StorioInformationService \| null>` |
| 41 | `storio.getComplaintOfficer(host?)` | `GET` | `/api/v2/template/complaint-officer/` | None | `Promise<StorioComplaintOfficer \| null>` |
| 42 | `storio.getHotlines(host?)` | `GET` | `/api/v2/template/hotlines/` | None | `Promise<StorioHotline[] \| null>` |
| 43 | `storio.apiFetch<T>(endpoint, options?)` | `GET/POST` | `*` | Custom Options | `Promise<T \| null>` |

---

## 3. Detailed Method & Data Payload Reference

### Section 1: Site Identity & Layout Configs

#### 1. `storio.getSettings(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/settings/`
- **Method Signature:** `storio.getSettings(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioSettingsResponse | null>`
- **Description:** Returns general site identity metadata like site title, tagline, branding logos, contact email/phone, social links, and SEO tags.
- **Query Parameters Supported:** None.
- **TypeScript Interface:** `StorioSettingsResponse`
- **Actual Live API Response:**
  ```json
  {
    "site_title": "ABC School and College",
    "site_tagline": "English Medium",
    "logo_url": "/media/uploads/logo.webp",
    "favicon_url": "/media/uploads/favicon.webp",
    "contact_email": "info@school.edu",
    "phone_number": "+8801700000000",
    "mobile_number": "",
    "social_links": [
      { "platform": "whatsapp", "url": "https://wa.me/#" }
    ],
    "mailing_address": "Main Road, Plot-19, Block-A, Mirpur, Dhaka-1216",
    "google_analytics_id": null,
    "google_tag_manager_id": null,
    "google_site_verification": "google_token_12345",
    "meta_pixel_id": "2568989898787878",
    "seo_title": "ABC School & College",
    "seo_description": "ABC School & College is an English Medium School in Dhaka, Bangladesh.",
    "seo_keywords": "School, Education, English Medium, Dhaka",
    "allow_indexing": true,
    "og_image_url": ""
  }
  ```

#### 2. `storio.getCustomization(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/customization/`
- **Method Signature:** `storio.getCustomization(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCustomizationResponse | null>`
- **Description:** Returns the active template design configuration (`config`), including custom theme colors, typography, and section toggles declared in the template manifest.
- **Query Parameters Supported:** None.
- **TypeScript Interface:** `StorioCustomizationResponse`
- **Actual Live API Response:**
  ```json
  {
    "config": {
      "showHero": true,
      "navbarLinks": [],
      "primaryColor": "#333333"
    }
  }
  ```

#### 3. `storio.getNavigation(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/navigation/`
- **Method Signature:** `storio.getNavigation(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNavigationResponse | null>`
- **Description:** Returns the active navigation menu links extracted from the template's customization config (`navbarLinks`).
- **Query Parameters Supported:** None.
- **TypeScript Interface:** `StorioNavigationResponse`
- **Actual Live API Response:**
  ```json
  {
    "items": [
      {
        "id": "1",
        "name": "About Us",
        "href": "/about",
        "subLinks": [
          { "id": "1-1", "name": "Faculty Directory", "href": "/about/faculty" },
          { "id": "1-2", "name": "Infrastructure", "href": "/about/infrastructure" }
        ]
      },
      { "id": "2", "name": "Academics", "href": "/academics" },
      { "id": "3", "name": "Notice Board", "href": "/notices" },
      { "id": "4", "name": "Contact Us", "href": "/contact" }
    ]
  }
  ```
  *(Note: Items map to `StorioNavigationItem` and can support `name`/`href`/`subLinks` or `label`/`url`/`children` depending on the template navigation declaration.)*

#### 4. `storio.getLayout(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/layout/`
- **Method Signature:** `storio.getLayout(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioLayoutResponse | null>`
- **Description:** Aggregation endpoint combining `settings`, `customization`, and `navigation` into a single high-performance payload. Highly recommended for root Next.js `layout.tsx` files.
- **Query Parameters Supported:** None.
- **TypeScript Interface:** `StorioLayoutResponse`
- **Actual Live API Response:**
  ```json
  {
    "settings": {
      "site_title": "ABC School and College",
      "site_tagline": "English Medium",
      "logo_url": "/media/uploads/logo.webp",
      "favicon_url": "/media/uploads/favicon.webp",
      "contact_email": "info@school.edu",
      "phone_number": "+8801700000000",
      "social_links": [
        { "platform": "whatsapp", "url": "https://wa.me/#" }
      ],
      "mailing_address": "Main Road, Plot-19, Block-A, Mirpur, Dhaka-1216",
      "google_analytics_id": null,
      "google_tag_manager_id": null,
      "seo_title": "ABC School & College",
      "seo_description": "ABC School & College is an English Medium School in Dhaka, Bangladesh.",
      "seo_keywords": "School, Education, English Medium, Dhaka",
      "allow_indexing": true,
      "og_image_url": ""
    },
    "customization": {
      "config": {
        "showHero": true,
        "navbarLinks": [],
        "primaryColor": "#333333"
      }
    },
    "navigation": {
      "items": []
    }
  }
  ```

#### 5. `storio.getInstitutionProfile(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/institution-profile/`
- **Method Signature:** `storio.getInstitutionProfile(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioInstitutionProfile | null>`
- **Description:** Institutional identity details, including ministry EIN/EIIN registration codes, student/teacher stats, mission, vision, recognition documents, and important links.
- **Query Parameters Supported:** None.
- **TypeScript Interface:** `StorioInstitutionProfile`
- **Actual Live API Response:**
  ```json
  {
    "id": 1,
    "institution_image": 1,
    "institution_image_url": "/media/uploads/school_building.webp",
    "eiin": 123456,
    "school_code": null,
    "school_shift": "Morning",
    "school_type": "Boys & Girls",
    "division": "Dhaka",
    "district": "Dhaka",
    "upazila": "Mirpur",
    "ward_no": null,
    "school_details": "Comprehensive institution providing high quality modern education.",
    "additional_info": [],
    "important_links": [
      {
        "id": 1,
        "title": "Education Board",
        "url": "https://shed.gov.bd/",
        "order": 0,
        "created_at": "2026-08-10T13:23:08.993429Z",
        "updated_at": "2026-08-10T13:23:08.993463Z"
      }
    ],
    "key_metrics": [],
    "metrics_title": "Our Key Achievements",
    "total_students": 522,
    "total_teachers": 25,
    "total_students_label": "Total Students",
    "total_teachers_label": "Total Teachers",
    "mission": "Empowering learners through knowledge and character.",
    "vision": "Fostering leadership, excellence, and innovation.",
    "education_board": "Dhaka",
    "recognition_levels": [
      "Secondary",
      "Higher Secondary"
    ],
    "academic_recognition": [],
    "recognition_documents": [
      {
        "name": "accreditation-certificate.pdf",
        "file_id": 53,
        "file_url": "https://tenant.storio.app/media/uploads/accreditation-certificate.pdf"
      }
    ],
    "created_at": "2026-07-09T04:38:19.017360Z",
    "updated_at": "2026-09-28T06:33:34.304715Z"
  }
  ```

---

### Section 2: Hero Carousel Banners

#### 6. `storio.getHeroSlides(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/hero-slides/`
- **Method Signature:** `storio.getHeroSlides(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioHeroSlide[] | null>`
- **Description:** Carousel slider banners displayed on the home page hero section, complete with CTA buttons, headlines, colors, and responsive background images.
- **Query Parameters Supported:** None (public endpoint returns all active slides ordered by `order`).
- **TypeScript Interface:** `StorioHeroSlide[]`
- **Actual Live API Response (Array):**
  ```json
  [
    {
      "id": 1,
      "bgImage_data": {
        "id": 36,
        "file": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
        "file_name": "f5a965e4b3c08ed4eb24ea3081309e28.webp",
        "title": null,
        "alt_text": null
      },
      "heading": "Welcome to Our Campus",
      "subheading": "Inspiring minds, building character, and empowering future leaders.",
      "buttonText": "Explore Programs",
      "buttonLink": "/academics",
      "create_date": "2026-08-03T13:18:30.205639Z",
      "update_date": "2026-08-03T13:18:30.205678Z",
      "bgType": "image",
      "bgImage_url": null,
      "bgColor": null,
      "gradientFrom": null,
      "gradientTo": null,
      "gradientDir": null,
      "status": "active",
      "textPosition": "center",
      "headingColor": "#FFFFFF",
      "subheadingColor": "#E0E0E0",
      "buttonColor": "#4F46E5",
      "buttonTextColor": "#FFFFFF",
      "order": 1,
      "bgImage": 36
    }
  ]
  ```
  *(Note: Templates map the slide headline from `heading` (or legacy `title`), subtitle from `subheading`, button label from `buttonText`, button link from `buttonLink`, and background image from `bgImage_data.file` or `bgImage_url`.)*

---

### Section 3: Public Notice Board & Announcements

#### 7. `storio.getNotices(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/notices/`
- **Method Signature:** `storio.getNotices(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNotice[] | null>`
- **Description:** List of public notices, circulars, and announcements with optional filtering by keywords or status.
- **Query Parameters Supported:**
  - `search` (`string`, optional): Case-insensitive search across notice `title` and `content`.
  - `status` (`string`, optional): Filter by notice status (`published`).
- **TypeScript Interface:** `StorioNotice[]`
- **Actual Live API Response (Array):**
  ```json
  [
    {
      "id": 7,
      "title": "Annual Sports Meet & Schedule Guidelines 2026",
      "content": "<p>The Annual Sports Meet will be held across three phases from March 5th to March 8th...</p>",
      "status": "published",
      "publish_date": "2026-10-12T17:41:06.315844Z",
      "create_date": "2026-10-12T17:12:46.615643Z",
      "update_date": "2026-10-12T17:12:46.615689Z",
      "deleted_at": null,
      "created_by": "admin",
      "pdf_view_mode": true,
      "attachments": [12],
      "attachments_detail": [
        {
          "id": 12,
          "file": "/media/uploads/sports_guidelines_2026.pdf",
          "file_type": "document",
          "file_name": "sports_guidelines_2026.pdf",
          "file_size": 2457600,
          "file_size_display": "2.34 MB",
          "alt_text": "Annual Sports Meet Official Guidelines PDF",
          "uploaded_by": "admin",
          "create_date": "2026-10-12T17:10:00Z",
          "update_date": "2026-10-12T17:10:00Z"
        }
      ]
    }
  ]
  ```

#### 8. `storio.getNoticeDetail(id, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/notices/${id}/`
- **Method Signature:** `storio.getNoticeDetail(id: number | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNotice | null>`
- **Description:** Single notice detail view containing full sanitized HTML content, document attachment details, view modes, and publishing metadata.
- **Path Parameters:**
  - `id` (`number | string`, required): The numeric primary key ID of the notice.
- **Query Parameters Supported:** None.
- **TypeScript Interface:** `StorioNotice`
- **Actual Live API Response:**
  ```json
  {
    "id": 7,
    "title": "Annual Sports Meet & Schedule Guidelines 2026",
    "content": "<p>All students, faculty members, and guardians are hereby informed that the Annual Sports Competition 2026 will be held across three phases from March 5th to March 8th at the Central Stadium...</p>",
    "status": "published",
    "publish_date": "2026-10-12T17:41:06.315844Z",
    "create_date": "2026-10-12T17:12:46.615643Z",
    "update_date": "2026-10-12T17:12:46.615689Z",
    "deleted_at": null,
    "created_by": "admin",
    "pdf_view_mode": true,
    "attachments": [12],
    "attachments_detail": [
      {
        "id": 12,
        "file": "/media/uploads/sports_guidelines_2026.pdf",
        "file_type": "document",
        "file_name": "sports_guidelines_2026.pdf",
        "file_size": 2457600,
        "file_size_display": "2.34 MB",
        "alt_text": "Annual Sports Meet Official Guidelines PDF",
        "uploaded_by": "admin",
        "create_date": "2026-10-12T17:10:00Z",
        "update_date": "2026-10-12T17:10:00Z"
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
  - `search` (`string`, optional): Case-insensitive search across post `title`, `content`, and `author`.
  - `category` (`number | string`, optional): Filter posts by category ID.
- **TypeScript Interface:** `StorioBlogPost[]`
- **Actual Live API Response (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Modern Approaches in Digital Education",
      "slug": "modern-approaches-digital-education",
      "content": "<p>Integrating interactive smart boards and collaborative learning...</p>",
      "excerpt": "Exploring pedagogical shifts and smart classroom technologies.",
      "author": "Dr. Sarah Jenkins",
      "status": "published",
      "status_display": "Published",
      "tags": ["education", "technology"],
      "publish_date": "2026-02-15T09:00:00Z",
      "deleted_at": null,
      "created_by": null,
      "featured_image": 42,
      "featured_image_data": {
        "id": 42,
        "file": "/media/uploads/digital_classroom.webp",
        "file_type": "image",
        "file_name": "digital_classroom.webp",
        "file_size": 1540000,
        "file_size_display": "1.47 MB",
        "title": "Digital Classroom",
        "alt_text": "Students collaborating in a smart classroom",
        "caption": null,
        "description": null,
        "uploaded_by": "admin",
        "create_date": "2026-02-15T08:45:00Z",
        "update_date": "2026-02-15T08:45:00Z"
      },
      "seo_title": "Digital Education Trends",
      "seo_description": "Discover how interactive digital tools elevate student performance.",
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
  ]
  ```

#### 10. `storio.getBlogDetail(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/blogs/${slug}/`
- **Method Signature:** `storio.getBlogDetail(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioBlogPost | null>`
- **Description:** Full article details by slug for single blog post pages, including rich-text HTML content, featured media file details, author attribution, categorization, and SEO tags.
- **Path Parameters:**
  - `slug` (`string`, required): The URL slug identifier of the blog post.
- **Query Parameters Supported:** None.
- **TypeScript Interface:** `StorioBlogPost`
- **Actual Live API Response:**
  ```json
  {
    "id": 1,
    "title": "Modern Approaches in Digital Education",
    "slug": "modern-approaches-digital-education",
    "content": "<p>Integrating interactive smart boards and modular project-based learning into secondary curricula fosters deeper analytical thinking. Recent studies demonstrate significant increases in comprehension...</p>",
    "excerpt": "Exploring pedagogical shifts and smart classroom technologies.",
    "author": "Dr. Sarah Jenkins",
    "status": "published",
    "status_display": "Published",
    "tags": ["education", "technology"],
    "publish_date": "2026-02-15T09:00:00Z",
    "deleted_at": null,
    "created_by": null,
    "featured_image": 42,
    "featured_image_data": {
      "id": 42,
      "file": "/media/uploads/digital_classroom.webp",
      "file_type": "image",
      "file_name": "digital_classroom.webp",
      "file_size": 1540000,
      "file_size_display": "1.47 MB",
      "title": "Digital Classroom",
      "alt_text": "Students collaborating in a smart classroom",
      "caption": null,
      "description": null,
      "uploaded_by": "admin",
      "create_date": "2026-02-15T08:45:00Z",
      "update_date": "2026-02-15T08:45:00Z"
    },
    "seo_title": "Digital Education Trends",
    "seo_description": "Discover how interactive digital tools elevate student performance.",
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
- **Query Parameters Supported:** None (public endpoint returns all active staff ordered by `order`).
- **TypeScript Interface:** `StorioStaffMember[]`
- **Actual Live API Response (Array):**
  ```json
  [
    {
      "id": 1,
      "name": "Prof. Arthur Pendelton",
      "role": "Teacher",
      "department": 1,
      "department_name": "Academics",
      "department_id": 1,
      "email": "principal@school.edu",
      "phone": "+8801700000001",
      "is_mpo": true,
      "joining_date": "2024-01-01",
      "bio": "Senior educator with extensive experience.",
      "profile_pic": 12,
      "profile_pic_data": {
        "id": 12,
        "file_url": "/media/uploads/staff_profile.webp",
        "alt_text": "Prof. Arthur Pendelton Profile",
        "file_type": "image"
      },
      "status": "active",
      "order": 1,
      "create_date": "2026-08-01T10:00:00Z",
      "update_date": "2026-08-01T10:00:00Z"
    }
  ]
  ```

#### 12. `storio.getTeam(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/team/`
- **Method Signature:** `storio.getTeam(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioTeamMember[] | null>`
- **Description:** Executive leadership, Governing Body, Board of Trustees, and Managing Committee members.
- **Query Parameters Supported:**
  - `section` (`number | string`, optional): Filter team members by section ID.
- **TypeScript Interface:** `StorioTeamMember[]`
- **Actual Live API Response (Array):**
  ```json
  [
    {
      "id": 1,
      "fullname": "Dr. Alam",
      "designation": "Chairman of the Governing Body and education advocate.",
      "role": "Chairman",
      "experience": "Former Vice-Chancellor, Ph.D. in Education Administration.",
      "section": 1,
      "section_name": "Governing Body",
      "phone": "+8801700000002",
      "address": "Dhaka, Bangladesh",
      "tenure_start": "2022-01-01",
      "tenure_end": "2026-12-31",
      "image": 15,
      "image_data": {
        "id": 15,
        "file_url": "/media/uploads/chairman.webp",
        "alt_text": "Dr. Alam",
        "caption": "Chairman"
      },
      "image_shape": "circle",
      "image_shape_display": "Circle",
      "is_visible": true,
      "order": 1,
      "create_date": "2026-08-01T10:00:00Z",
      "update_date": "2026-08-01T10:00:00Z"
    }
  ]
  ```

---

### Section 6: Media Gallery & Photo Albums

#### 13. `storio.getGallery(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/gallery/`
- **Method Signature:** `storio.getGallery(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioGalleryItem[] | null>`
- **Description:** Standalone photo gallery showcase items with titles and album associations.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "media": 36,
      "media_data": {
        "id": 36,
        "file_size_display": "7.05 KB",
        "file": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
        "create_date": "2026-07-09T09:52:03.178696Z",
        "update_date": "2026-07-09T09:52:03.178769Z",
        "file_type": "image",
        "file_name": "f5a965e4b3c08ed4eb24ea3081309e28.webp",
        "file_size": 7222,
        "title": null,
        "alt_text": null,
        "caption": null,
        "description": null
      },
      "image_title": "Campus Grounds",
      "caption": "Morning view of the campus",
      "alt_text": "Campus",
      "album": 1,
      "album_name": "Campus Life",
      "tags": "campus, photo",
      "is_visible": true,
      "create_date": "2026-07-09T09:55:00Z",
      "update_date": "2026-07-09T09:55:00Z"
    }
  ]
  ```

#### 14. `storio.getAlbums(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/albums/`
- **Method Signature:** `storio.getAlbums(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAlbum[] | null>`
- **Description:** Photo albums with cover photos and total photo count.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "name": "Campus Exhibitions",
      "slug": "campus-exhibitions",
      "description": "Annual exhibitions and art showcase",
      "parent": null,
      "parent_name": null,
      "total_images": 12,
      "create_date": "2026-07-09T09:50:00Z",
      "update_date": "2026-07-09T09:50:00Z"
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
  - `search` (`string`): Search across activity title, content, and author.
  - `category` (`number`): Filter by activity category ID.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 5,
      "title": "Robotics & STEM Workshop 2026",
      "slug": "robotics-stem-workshop-2026",
      "content": "<p>Students designed autonomous rovers and prototyped microcontrollers in our annual STEM workshop.</p>",
      "excerpt": "Junior engineers prototype microcontrollers and rovers.",
      "author": "Department of Science",
      "status": "published",
      "status_display": "Published",
      "deleted_at": null,
      "created_by": null,
      "gallery_images": [
        {
          "id": 1,
          "image_details": {
            "id": 36,
            "file": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
            "file_name": "f5a965e4b3c08ed4eb24ea3081309e28.webp",
            "file_type": "image",
            "file_size": 7222,
            "file_size_display": "7.05 KB"
          },
          "caption": "Rover testing on competition track",
          "order": 1
        }
      ],
      "featured_image_data": {
        "id": 36,
        "file": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
        "file_type": "image",
        "file_name": "f5a965e4b3c08ed4eb24ea3081309e28.webp",
        "file_size": 7222,
        "file_size_display": "7.05 KB"
      },
      "seo_title": "STEM Workshop 2026",
      "seo_description": "Highlights from our annual robotics event.",
      "view_count": 48,
      "is_featured": true,
      "categories": [1],
      "categories_data": [
        {
          "id": 1,
          "name": "STEM & Robotics",
          "slug": "stem-robotics",
          "description": "Engineering workshops and clubs",
          "parent": null,
          "parent_name": null,
          "activities_count": 4,
          "create_date": "2026-07-09T08:00:00Z",
          "update_date": "2026-07-09T08:00:00Z"
        }
      ],
      "create_date": "2026-07-09T09:00:00Z",
      "update_date": "2026-07-09T09:00:00Z"
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
    "id": 5,
    "title": "Robotics & STEM Workshop 2026",
    "slug": "robotics-stem-workshop-2026",
    "content": "<p>Students designed autonomous rovers and prototyped microcontrollers in our annual STEM workshop.</p>",
    "excerpt": "Junior engineers prototype microcontrollers and rovers.",
    "author": "Department of Science",
    "status": "published",
    "status_display": "Published",
    "deleted_at": null,
    "created_by": null,
    "gallery_images": [
      {
        "id": 1,
        "image_details": {
          "id": 36,
          "file": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
          "file_name": "f5a965e4b3c08ed4eb24ea3081309e28.webp",
          "file_type": "image",
          "file_size": 7222,
          "file_size_display": "7.05 KB"
        },
        "caption": "Rover testing on competition track",
        "order": 1
      }
    ],
    "featured_image_data": {
      "id": 36,
      "file": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
      "file_type": "image",
      "file_name": "f5a965e4b3c08ed4eb24ea3081309e28.webp",
      "file_size": 7222,
      "file_size_display": "7.05 KB"
    },
    "seo_title": "STEM Workshop 2026",
    "seo_description": "Highlights from our annual robotics event.",
    "view_count": 48,
    "is_featured": true,
    "categories": [1],
    "categories_data": [
      {
        "id": 1,
        "name": "STEM & Robotics",
        "slug": "stem-robotics",
        "description": "Engineering workshops and clubs",
        "parent": null,
        "parent_name": null,
        "activities_count": 4,
        "create_date": "2026-07-09T08:00:00Z",
        "update_date": "2026-07-09T08:00:00Z"
      }
    ],
    "create_date": "2026-07-09T09:00:00Z",
    "update_date": "2026-07-09T09:00:00Z"
  }
  ```

#### 17. `storio.getEvents(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/events/`
- **Method Signature:** `storio.getEvents(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioEvent[] | null>`
- **Description:** Institutional events list with dates, map locations, categories, and event status. Note that the live backend returns a standard paginated response object containing `results`.
- **Query Parameters Supported:**
  - `status` (`string`): Filter by status (`draft`, `published`, `cancelled`). Defaults to `published`.
  - `categories` (`number`): Filter by category ID.
  - `is_featured` (`boolean`): Filter featured events (`true` / `false`).
  - `search` (`string`): Search across event title, content, and location.
  - `ordering` (`string`): Sort order (e.g. `start_date`, `-start_date`).
- **Data Payload Obtained (Paginated Object with `results` array):**
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "title": "Inter-School Science Olympiad 2026",
        "slug": "inter-school-science-olympiad-2026",
        "content": "<p>A 2-day science exhibition, project showcase, and robotics tournament for division schools.</p>",
        "excerpt": "Science competition for division schools.",
        "location": "Central Auditorium, Main Campus",
        "start_date": "2026-04-10T09:00:00Z",
        "end_date": "2026-04-11T17:00:00Z",
        "status": "published",
        "is_featured": true,
        "featured_image": 36,
        "featured_image_detail": {
          "id": 36,
          "file": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
          "file_name": "f5a965e4b3c08ed4eb24ea3081309e28.webp",
          "file_type": "image",
          "file_size": 7222,
          "file_size_display": "7.05 KB"
        },
        "categories": [1],
        "categories_detail": [
          {
            "id": 1,
            "name": "Science & Innovation",
            "events_count": 3
          }
        ],
        "view_count": 210,
        "created_at": "2026-07-09T09:50:00Z",
        "updated_at": "2026-07-09T09:50:00Z"
      }
    ]
  }
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
    "id": 1,
    "title": "Inter-School Science Olympiad 2026",
    "slug": "inter-school-science-olympiad-2026",
    "content": "<p>A 2-day science exhibition, project showcase, and robotics tournament for division schools.</p>",
    "excerpt": "Science competition for division schools.",
    "location": "Central Auditorium, Main Campus",
    "start_date": "2026-04-10T09:00:00Z",
    "end_date": "2026-04-11T17:00:00Z",
    "status": "published",
    "is_featured": true,
    "featured_image": 36,
    "featured_image_detail": {
      "id": 36,
      "file": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
      "file_name": "f5a965e4b3c08ed4eb24ea3081309e28.webp",
      "file_type": "image",
      "file_size": 7222,
      "file_size_display": "7.05 KB"
    },
    "categories": [1],
    "categories_detail": [
      {
        "id": 1,
        "name": "Science & Innovation",
        "events_count": 3
      }
    ],
    "view_count": 210,
    "created_at": "2026-07-09T09:50:00Z",
    "updated_at": "2026-07-09T09:50:00Z"
  }
  ```

---

### Section 8: Dynamic CMS Custom Builder Pages

#### 19. `storio.getPageBySlug(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/pages/by-slug/${slug}/`
- **Method Signature:** `storio.getPageBySlug(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCustomPage | null>`
- **Description:** Fetches custom dynamic pages constructed via the CMS page builder. Note that `content` is an array of dynamic CMS blocks (e.g. `RichText`, `CustomTable`, `ImageGallery`).
- **Query Parameters Supported:** None.
- **Data Payload Obtained:**
  ```json
  {
    "id": 1,
    "title": "Campus Life",
    "slug": "campus-life",
    "content": [
      {
        "id": "block-1",
        "type": "RichText",
        "title": "About Our Campus Life",
        "content": "<p>Vibrant student life and extracurricular opportunities across all grades.</p>"
      },
      {
        "id": "block-2",
        "type": "CustomTable",
        "title": "Activities Schedule",
        "content": {
          "headers": ["Club", "Timing", "Room"],
          "rows": [
            ["Chess Club", "Mon 3:00 PM", "Hall B"],
            ["Robotics Club", "Wed 4:00 PM", "Lab 2"]
          ]
        }
      }
    ],
    "featured_image": null,
    "is_published": true,
    "meta_title": null,
    "meta_description": null,
    "keywords": null,
    "created_at": "2026-07-16T11:46:23.528763Z",
    "updated_at": "2026-07-21T06:07:51.131553Z"
  }
  ```

---

### Section 9: Social Proof, Leadership & Promotions

#### 20. `storio.getTestimonials(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/testimonials/`
- **Method Signature:** `storio.getTestimonials(tenantHostOrOptions?: string | StorioFetchOptions): Promise<Record<string, unknown>[] | null>`
- **Description:** Testimonials from parents, alumni, university counselors, and community leaders.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "name": "Akbar Ali",
      "designation": "Parent & Guardian",
      "organization": null,
      "message": "The service was excellent from start to finish. The teachers are dedicated and caring.",
      "rating": 5,
      "photo": 1,
      "photo_data": {
        "id": 1,
        "file_url": "/media/uploads/parent.webp",
        "alt_text": "Akbar Ali",
        "file_type": "image"
      },
      "status": "active",
      "order": 1,
      "create_date": "2026-07-09T10:00:00Z",
      "update_date": "2026-07-09T10:00:00Z"
    }
  ]
  ```

#### 21. `storio.getLeadershipMessages(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/leadership-messages/`
- **Method Signature:** `storio.getLeadershipMessages(tenantHostOrOptions?: string | StorioFetchOptions): Promise<Record<string, unknown>[] | null>`
- **Description:** Official statements and welcome remarks from the Founder, Chairman, and Principal.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "section_title": "New Section",
      "name": "AKD Monir",
      "role": "Principal",
      "company": "ABC School",
      "message": "Great leadership, clear communication, and strong support throughout the entire process.",
      "image": 37,
      "image_data": {
        "id": 37,
        "file_url": "/media/uploads/principal.webp",
        "alt_text": null,
        "file_type": "image"
      },
      "signature": null,
      "signature_data": null,
      "status": "published",
      "display_order": 1,
      "create_date": "2026-07-10T18:21:43.931916Z",
      "update_date": "2026-08-09T08:03:08.920249Z"
    }
  ]
  ```

#### 22. `storio.getPromotions(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/promotions/`
- **Method Signature:** `storio.getPromotions(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioPromotion[] | null>`
- **Description:** Active promotion popups, top notification bars, and admission campaign alerts.
- **Query Parameters Supported:**
  - `type` (`string`): Filter by promotion type (`banner`, `popup`, `floating`, `slider`).
  - `target` (`string`): Target audience (`all`, `students`, `parents`, `teachers`).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Early Bird Admission Discount – Fall 2026",
      "subtitle": "Limited time tuition grant",
      "description": "Register before March 31st to waive the institutional registration processing fee.",
      "badge_text": "50% OFF",
      "image": 36,
      "image_detail": {
        "id": 36,
        "file_url": "/media/uploads/f5a965e4b3c08ed4eb24ea3081309e28.webp",
        "alt_text": "Admission Banner",
        "file_type": "image"
      },
      "promotion_type": "banner",
      "target_audience": "all",
      "cta_label": "Register Now",
      "cta_url": "/admissions/apply",
      "cta_is_external": false,
      "status": "published",
      "start_date": "2026-03-01",
      "end_date": "2026-04-30",
      "priority": 10,
      "view_count": 0,
      "click_count": 0,
      "is_live": true,
      "create_date": "2026-03-01T00:00:00Z",
      "update_date": "2026-03-01T00:00:00Z"
    }
  ]
  ```

---

### Section 10: Quick Links, FAQs, Videos & Exam Results

#### 23. `storio.getImportantLinks(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/important-links/`
- **Method Signature:** `storio.getImportantLinks(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioImportantLink[] | null>`
- **Description:** Curated government, ministerial, and educational resource links.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Edu borad",
      "url": "https://shed.gov.bd/",
      "order": 0
    },
    {
      "id": 4,
      "title": "Unicef",
      "url": "https://www.unicef.org/bangladesh/en/education",
      "order": 0
    }
  ]
  ```

#### 24. `storio.getFaqs(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/faqs/`
- **Method Signature:** `storio.getFaqs(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioFaq[] | null>`
- **Description:** Frequently asked questions categorized by admissions, fees, transport, and curriculum.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "question": "What is the admission procedure for Grade 1?",
      "answer": "<p>Applications must be submitted through our online portal along with birth registration certificate.</p>",
      "is_visible": true
    }
  ]
  ```

#### 25. `storio.getVideos(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/reels/`
- **Method Signature:** `storio.getVideos(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioVideoItem[] | null>`
- **Description:** Campus tour reels, YouTube video embeddings, and commencement ceremony recordings.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 9,
      "title": "Meet Storio — the AI-powered website builder.",
      "description": "Meet Storio — the AI-powered website builder.\n\nDescribe your idea.\nLet AI build it.\nCustomize and publish.\n\nYour professional website—within a minute.",
      "reel_type": "reel",
      "platform": "facebook",
      "url": "https://www.facebook.com/watch/?v=2127516717799828",
      "thumbnail_url": "/media/uploads/fb_thumb_2127516717799828_1791184235.webp",
      "views_count": 0,
      "likes_count": 0,
      "is_featured": false
    },
    {
      "id": 2,
      "title": "YouTube video",
      "description": "",
      "reel_type": "video",
      "platform": "youtube",
      "url": "https://www.youtube.com/embed/IxCPS27UrEU",
      "thumbnail_url": null,
      "views_count": 0,
      "likes_count": 0,
      "is_featured": false
    }
  ]
  ```

#### 26. `storio.getCalendarEvents(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/calendar/`
- **Method Signature:** `storio.getCalendarEvents(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCalendarEvent[] | null>`
- **Description:** Institutional academic calendar schedule with term breaks, exam sessions, and holidays.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 3,
      "title": "Sports Day",
      "description": "",
      "start_date": "2026-07-12T00:00:00Z",
      "end_date": "2026-07-16T00:00:00Z",
      "category": "festival",
      "level": "college",
      "is_all_day": true
    },
    {
      "id": 10,
      "title": "New Event",
      "description": "",
      "start_date": "2026-07-16T00:00:00Z",
      "end_date": "2026-07-16T00:00:00Z",
      "category": "academic",
      "level": "school-wide",
      "is_all_day": true
    }
  ]
  ```

#### 27. `storio.getExamResults(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/exam-results/`
- **Method Signature:** `storio.getExamResults(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioExamResult[] | null>`
- **Description:** Official published board and institutional examination result sheets.
- **Query Parameters Supported:**
  - `exam_type` (`string`): Filter by exam type (`admission`, `public`, `school`).
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 1,
      "exam_name": "Admission 2026",
      "class_name": "Class 9",
      "year": "2026",
      "total_examinees": 156,
      "passed": 139,
      "failed": 17,
      "aplus_count": 0,
      "agrade_count": 0,
      "pass_rate": "89.1%",
      "exam_type": "admission",
      "file_url": "/media/exam_results/Storio_Migration_Roadmap.pdf"
    },
    {
      "id": 3,
      "exam_name": "SSC",
      "class_name": "",
      "year": "2026",
      "total_examinees": 200,
      "passed": 200,
      "failed": 0,
      "aplus_count": 120,
      "agrade_count": 15,
      "pass_rate": "100.0%",
      "exam_type": "public",
      "file_url": "/media/exam_results/Storio_CMS_Template_Architecture_Review.pdf"
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
      "id": 1,
      "title": "Senior Mathematics Faculty Member",
      "slug": "senior-mathematics-faculty-member",
      "company_name": "Emerald International Academy",
      "location": "Dhaka, Bangladesh (On-site)",
      "job_type": "full_time",
      "vacancy": 2,
      "deadline": "2026-04-30",
      "description": "<p>We are seeking an experienced Mathematics Teacher for Cambridge A-Levels with at least 5 years of teaching experience.</p>",
      "application_link": "https://recruitment.storio.app/apply/math-2026",
      "status": "active",
      "attachments_data": [
        {
          "id": 36,
          "type": "document",
          "file_name": "job_circular_math_faculty.pdf",
          "url": "/media/uploads/job_circular_math_faculty.pdf",
          "alt_text": "Mathematics Faculty Recruitment Circular PDF"
        }
      ],
      "created_at": "2026-02-12T09:00:00Z",
      "updated_at": "2026-02-14T11:30:00Z"
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
    "id": 1,
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
        "id": 36,
        "type": "document",
        "file_name": "job_circular_math_faculty.pdf",
        "url": "/media/uploads/job_circular_math_faculty.pdf",
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
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "title": "এইচএসসি ও সমমান পরীক্ষার সময়সূচি ২০২৬",
      "url": "https://dhakaeducationboard.portal.gov.bd/pages/notices/hsc-routine-2026",
      "publish_date": "2026-03-15",
      "board_name": "dhaka"
    }
  ]
  ```

---

### Section 13: Online Admission Portal & Interactive Forms

#### 31. `storio.getAdmissionFormConfig(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/admission/form-config/current/`
- **Method Signature:** `storio.getAdmissionFormConfig(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionFormConfig | null>`
- **Description:** Active admission intake configuration, deadline, and dynamic form schema.
- **Query Parameters Supported:** None.
- **Data Payload Obtained:**
  ```json
  {
    "id": 2,
    "title": "Offline admission 1.3",
    "description": "Admission open 1.3",
    "is_active": true,
    "deadline": "2027-01-19",
    "fields": [
      {
        "id": "student_name",
        "type": "text",
        "label": "Student Name",
        "order": 1,
        "required": true
      },
      {
        "id": "dob",
        "type": "date",
        "label": "Date of Birth",
        "order": 2,
        "required": true
      },
      {
        "id": "gender",
        "type": "select",
        "label": "Gender",
        "order": 3,
        "options": [
          "Male",
          "Female",
          "Other"
        ],
        "required": true
      },
      {
        "id": "email",
        "type": "email",
        "label": "Email Address",
        "order": 4,
        "required": true
      },
      {
        "id": "phone",
        "type": "tel",
        "label": "Phone Number",
        "order": 5,
        "required": true
      },
      {
        "id": "class_grade",
        "type": "select",
        "label": "Class/Grade to Apply",
        "order": 6,
        "options": [
          "Grade 1",
          "Grade 2",
          "Grade 3",
          "Grade 4",
          "Grade 5",
          "Grade 6",
          "Grade 7",
          "Grade 8",
          "Grade 9",
          "Grade 10"
        ],
        "required": true
      },
      {
        "id": "guardian_name",
        "type": "text",
        "label": "Guardian Name",
        "order": 7,
        "required": true
      },
      {
        "id": "guardian_phone",
        "type": "tel",
        "label": "Guardian Phone",
        "order": 8,
        "required": true
      },
      {
        "id": "address",
        "type": "textarea",
        "label": "Address",
        "order": 9,
        "required": true
      },
      {
        "id": "previous_school",
        "type": "text",
        "label": "Previous School",
        "order": 10,
        "required": false
      }
    ],
    "created_at": "2026-07-09T05:31:23.105968Z",
    "updated_at": "2026-09-22T04:30:18.511032Z"
  }
  ```

#### 32. `storio.sendAdmissionOTP(email, phoneOrTenantHost?, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/admission/send-otp/`
- **Method Signature:** `storio.sendAdmissionOTP(email: string, phoneOrTenantHost?: string | StorioFetchOptions, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionOTPResponse | null>`
- **Description:** Dispatches a 6-digit verification code to the applicant's email address and optionally to mobile number via SMS.
- **Payload Sent:** `{ "email": "applicant@example.com", "phone": "+8801711000000" }`
- **Data Returned:**
  ```json
  {
    "success": true,
    "message": "Verification code sent to your email and phone."
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
    "message": "Email verified successfully"
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
      "email": "zara@example.com",
      "phone": "+8801711000000",
      "dob": "2010-06-15",
      "class_grade": "Grade 9"
    },
    "otp_code": "482910"
  }
  ```
- **Data Returned:**
  ```json
  {
    "id": 1,
    "application_number": "APP-2026-00421",
    "form_data": {
      "student_name": "Zara Rahman",
      "email": "zara@example.com",
      "phone": "+8801711000000",
      "dob": "2010-06-15",
      "class_grade": "Grade 9"
    },
    "submitted_at": "2026-10-13T11:00:00Z"
  }
  ```

#### 35. `storio.submitContactMessage(formData, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/contact/` (Backend route: `POST /api/contact/`)
- **Method Signature:** `storio.submitContactMessage(formData: Record<string, unknown>, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioContactFormResponse | null>`
- **Description:** Submits public contact messages and inquiry requests from the template contact page directly into the tenant admin mailbox.
- **Payload Sent:**
  ```json
  {
    "name": "Mahmudul Hasan",
    "email": "m.hasan@example.com",
    "phone": "+880 1711-333333",
    "subject": "Inquiry regarding A-Level Chemistry Lab facilities",
    "message": "Greetings, I would like to schedule a campus visit next Tuesday...",
    "recaptcha_token": "token_string_here"
  }
  ```
- **Data Returned:**
  ```json
  {
    "id": 1,
    "name": "Mahmudul Hasan",
    "email": "m.hasan@example.com",
    "subject": "Inquiry regarding A-Level Chemistry Lab facilities",
    "message": "Greetings, I would like to schedule a campus visit next Tuesday...",
    "status": "unread",
    "created_at": "2026-10-13T11:00:00Z"
  }
  ```

---

### Section 14: Academics

#### 36. `storio.getClassRoutines(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/academic/class-routines/`
- **Method Signature:** `storio.getClassRoutines(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioClassRoutine[] | null>`
- **Description:** Retrieves weekly class routines, period schedules, and downloadable timetable documents.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 7,
      "class_name": "Class 8",
      "section": "A",
      "shift": "Morning",
      "academic_year": 2026,
      "effective_from": "2026-10-01",
      "routine_file": null,
      "routine_file_url": null,
      "is_active": true,
      "schedule": [
        {
          "day": "Sunday",
          "periods": [
            {
              "period_number": 1,
              "subject": "English",
              "teacher_name": "AKM Jamil",
              "room_no": "112",
              "start_time": "10:00 AM",
              "end_time": "10:45 AM"
            },
            {
              "period_number": 2,
              "subject": "Physics",
              "teacher_name": "Mosha",
              "room_no": "112",
              "start_time": "10:46 AM",
              "end_time": "11:30 AM"
            }
          ]
        }
      ],
      "created_at": "2026-09-28T06:59:38.037740Z",
      "updated_at": "2026-09-28T07:33:36.322553Z"
    }
  ]
  ```

#### 37. `storio.getSyllabuses(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/academic/syllabuses/`
- **Method Signature:** `storio.getSyllabuses(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioSyllabus[] | null>`
- **Description:** Term syllabuses, learning outcomes, curriculum overviews, and downloadable PDF course packs.
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 2,
      "title": "Class 9 Annual Examination Syllabus 2026",
      "class_name": "Class 9",
      "exam_type": "Final Exam",
      "academic_year": 2026,
      "file": 53,
      "file_url": "/media/uploads/syllabus_class_9.pdf",
      "file_size": "125601 KB",
      "description": "Comprehensive syllabus for final examination 2026.",
      "uploaded_at": "2026-09-27T09:35:00.610161Z",
      "is_active": true
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
    "grand_total_male": 145,
    "grand_total_female": 136,
    "grand_total": 281,
    "total_sections": 5,
    "classes": [
      {
        "id": 9,
        "academic_year": 2026,
        "year": 2026,
        "program": null,
        "class_name": "Class 8",
        "class_name_en": "Class 8",
        "shift": "Morning",
        "order": 6,
        "total_male": 32,
        "total_female": 22,
        "total_students": 54,
        "groups": [
          {
            "group_name": "General",
            "sections": [
              "A",
              "B",
              "C"
            ],
            "total_male": 32,
            "total_female": 22,
            "total_students": 54
          }
        ],
        "created_at": "2026-09-28T06:53:06.185590Z",
        "updated_at": "2026-09-28T08:03:53.198382Z"
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

---

### Section 15: Citizen Charter & Institutional Compliance

#### 39. `storio.getMpoInfo(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/mpo-info/`
- **Method Signature:** `storio.getMpoInfo(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioMpoInfo | null>`
- **Description:** Official government Monthly Pay Order (MPO) compliance details, committee approval resolutions, and institutional gazette certificates.
- **Query Parameters Supported:** None.
- **Data Payload Obtained:**
  ```json
  {
    "id": 1,
    "is_mpo_enlisted": true,
    "mpo_status": "MPO Enlisted",
    "mpo_code": "MPO-2026-9999",
    "mpo_date": "2026-01-01",
    "mpo_order_number": "GOV-MPO-9876",
    "subtitle": "Official MPO Accreditation",
    "description": "Government subsidized institution status",
    "total_mpo_teachers": 15,
    "total_non_mpo_teachers": 10,
    "documents": [
      {
        "name": "MPO Gazette",
        "file_id": 53,
        "file_url": "http://school.localhost:3000/media/uploads/mausi-compliance-api-spec.pdf"
      }
    ],
    "created_at": "2026-09-27T05:34:01.607666Z",
    "updated_at": "2026-09-28T10:24:36.730323Z"
  }
  ```

#### 40. `storio.getInformationService(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/information-service/`
- **Method Signature:** `storio.getInformationService(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioInformationService | null>`
- **Description:** Right to Information (RTI) designated officer profiles, appeals authority contact details, and citizen service procedures.
- **Query Parameters Supported:** None.
- **Data Payload Obtained:**
  ```json
  {
    "id": 1,
    "title": "Information Service Center Desk",
    "address": "Admin Building Room 101, Dhaka",
    "responsible_person": "Md. Rafiqul Islam",
    "designation": "Information Officer",
    "mobile": "+8801700000099",
    "phone": "+88029990001",
    "email": "info@school.edu.bd",
    "photo": 1,
    "photo_url": "/media/uploads/info_officer.webp",
    "office_hours": "09:00 AM - 04:00 PM (Everyday (Sat - Thu))",
    "description": "RTI Information Desk",
    "services_offered": [
      "Admissions Info",
      "Transcript Inquiries",
      "General Inquiries",
      "Citizen Right to Information (RTI)"
    ],
    "created_at": "2026-09-27T05:34:01.672935Z",
    "updated_at": "2026-09-28T10:17:32.718840Z"
  }
  ```

#### 41. `storio.getComplaintOfficer(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/complaint-officer/`
- **Method Signature:** `storio.getComplaintOfficer(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioComplaintOfficer | null>`
- **Description:** Grievance Redress System (GRS) compliance officer profile, formal grievance escalation steps, and appeal workflows.
- **Query Parameters Supported:** None.
- **Data Payload Obtained:**
  ```json
  {
    "id": 1,
    "name": "Prof. Abu Taher",
    "designation": "Assistant Headmaster & GRS Focal Point",
    "address": "Room 205, Main Academic Building",
    "mobile": "+8801700000002",
    "phone": "+88029990002",
    "email": "complaint.officer@school.edu.bd",
    "photo": 48,
    "photo_url": "/media/uploads/grs_officer.webp",
    "description": "Grievance Redress System Officer",
    "complaint_process": "1. Submit written application\n2. Review within 7 working days",
    "office_hours": "08:00 AM - 05:00 PM (Sunday to Thursday)",
    "created_at": "2026-09-27T05:34:01.687833Z",
    "updated_at": "2026-09-28T10:12:44.148815Z"
  }
  ```

#### 42. `storio.getHotlines(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/hotlines/`
- **Method Signature:** `storio.getHotlines(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioHotline[] | null>`
- **Description:** Government, legal, and public safety emergency hotlines (e.g. 999 National Emergency, 1098 Child Helpline, 333 Government Services).
- **Query Parameters Supported:** None.
- **Data Payload Obtained (Array):**
  ```json
  [
    {
      "id": 11,
      "title": "Emergency College Service",
      "number": "4567",
      "description": "24/7 service",
      "category": "institution",
      "is_emergency": true,
      "order": 0,
      "is_active": true,
      "created_at": "2026-09-28T10:26:21.926348Z",
      "updated_at": "2026-09-28T10:26:21.926369Z"
    },
    {
      "id": 2,
      "title": "National Emergency Service",
      "number": "999",
      "description": "24/7 Police, Fire, Ambulance",
      "category": "emergency",
      "is_emergency": true,
      "order": 2,
      "is_active": true,
      "created_at": "2026-09-27T05:34:01.712134Z",
      "updated_at": "2026-09-27T05:34:01.712152Z"
    }
  ]
  ```

---

### Section 16: Core API Fetcher (`apiFetch`)

#### 43. `storio.apiFetch<T>(endpoint, options?)`
- **Signature:** `apiFetch<T>(endpoint: string, options?: StorioFetchOptions): Promise<T | null>`
- **Description:** Low-level, generic fetch wrapper used internally by all SDK methods. Use this if you need to fetch a custom endpoint or send specialized HTTP headers not covered by built-in methods.

---

## 4. Complete TypeScript Type Interfaces

Here are all 45 TypeScript interfaces exported directly by `@storio/template-sdk`:

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
  mobile_number?: string;
  social_links?: StorioSocialLink[];
  mailing_address?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
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

export interface AcademicRecognition {
  id?: number;
  level?: string;
  recognition_type?: string;
  valid_until?: string;
  order_number?: string;
}

export interface RecognitionDocument {
  id?: number;
  title?: string;
  file_url?: string;
  issue_date?: string;
}

export interface StorioInstitutionProfile {
  id: number;
  institution_image_url?: string;
  eiin?: number | string;
  school_code?: string;
  school_shift?: string;
  school_type?: string;
  division?: string;
  district?: string;
  upazila?: string;
  ward_no?: string;
  school_details?: string;
  additional_info?: Array<{ label?: string; value?: string }>;
  important_links?: Array<{ label?: string; url?: string }>;
  key_metrics?: unknown[];
  metrics_title?: string;
  total_students?: number;
  total_teachers?: number;
  total_students_label?: string;
  total_teachers_label?: string;
  mission?: string;
  vision?: string;
  education_board?: string;
  recognition_levels?: string[];
  academic_recognition?: AcademicRecognition[];
  recognition_documents?: RecognitionDocument[];
  created_at?: string;
  updated_at?: string;
}

export interface StorioLayoutResponse {
  settings: StorioSettingsResponse;
  customization: StorioCustomizationResponse;
  navigation: StorioNavigationResponse;
}

export interface StorioHeroSlide {
  id: number;
  title?: string;
  subtitle?: string;
  image_url?: string;
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
  designation?: string;
  department?: string;
  photo_url?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  is_mpo?: boolean;
}

export interface StorioTeamMember {
  id: number;
  fullname: string;
  designation: string;
  role?: string;
  experience?: string;
  section?: number;
  section_name?: string;
  phone?: string;
  address?: string;
  tenure_start?: string;
  tenure_end?: string;
  image?: number;
  image_data?: {
    id?: number;
    file_url?: string;
    alt_text?: string;
    caption?: string;
  } | null;
  image_shape?: string;
  image_shape_display?: string;
  is_visible?: boolean;
  order?: number;
  create_date?: string;
  update_date?: string;
}

export interface StorioGalleryItem {
  id: number;
  title?: string;
  image_url: string;
  caption?: string;
}

export interface StorioAlbum {
  id: number;
  title: string;
  cover_image_url?: string;
  images?: StorioGalleryItem[];
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
  featured_image?: string;
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
  content: string | Record<string, unknown>[];
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
}

export interface StorioAdmissionField {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  order?: number;
  options?: string[];
  logic?: Record<string, unknown>;
  default?: unknown;
}

export interface StorioAdmissionFormConfig {
  id?: number;
  fields?: StorioAdmissionField[];
  is_active?: boolean;
  updated_at?: string;
}

export interface StorioAdmissionOTPResponse {
  success: boolean;
  message?: string;
}

export interface StorioAdmissionApplicationResponse {
  application_number?: string;
  success?: boolean;
  message?: string;
  error?: string;
}

export interface StorioContactFormResponse {
  success: boolean;
  message?: string;
}

export interface StorioImportantLink {
  id: number;
  title: string;
  url: string;
  order?: number;
}

export interface StorioBoardNotice {
  id?: number;
  title?: string;
  publish_date?: string;
  url?: string;
  board?: string;
}

export interface StorioPromotion {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  badge_text?: string;
  image?: string;
  image_detail?: string;
  cta_label?: string;
  cta_url?: string;
  cta_is_external?: boolean;
}

export interface StorioFaq {
  id: number;
  question: string;
  answer: string;
  is_visible?: boolean;
}

export interface StorioVideoItem {
  id: number;
  title: string;
  description?: string;
  reel_type?: string;
  platform?: string;
  url?: string;
  thumbnail_url?: string;
  views_count?: number;
  likes_count?: number;
  is_featured?: boolean;
}

export interface StorioCalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  level?: string;
  is_all_day?: boolean;
}

export interface StorioExamResult {
  id: number;
  exam_name?: string;
  class_name?: string;
  year?: number | string;
  total_examinees?: number;
  passed?: number;
  failed?: number;
  pass_rate?: string | number;
  exam_type?: string;
  file_url?: string;
}

export interface StorioClassRoutineScheduleItem {
  period?: number;
  subject?: string;
  teacher?: string;
  room?: string;
  start_time?: string;
  end_time?: string;
}

export interface StorioClassRoutineDaySchedule {
  day: string;
  periods?: StorioClassRoutineScheduleItem[];
  slots?: StorioClassRoutineScheduleItem[];
}

export interface StorioClassRoutine {
  id: number;
  class_name: string;
  section?: string;
  shift?: string;
  academic_year?: number;
  effective_from?: string;
  routine_file?: number;
  routine_file_url?: string;
  is_active?: boolean;
  schedule?: StorioClassRoutineDaySchedule[] | Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface StorioSyllabus {
  id: number;
  title: string;
  class_name: string;
  exam_type?: string;
  academic_year?: number;
  file?: number;
  file_url?: string;
  file_size?: string;
  description?: string;
  uploaded_at?: string;
  is_active?: boolean;
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

export interface StorioMpoDocument {
  title?: string;
  file_url?: string;
  issue_date?: string;
}

export interface StorioMpoInfo {
  id: number;
  is_mpo_enlisted: boolean;
  mpo_status?: string;
  mpo_code?: string;
  mpo_date?: string;
  mpo_order_number?: string;
  subtitle?: string;
  description?: string;
  total_mpo_teachers?: number;
  total_non_mpo_teachers?: number;
  documents?: StorioMpoDocument[];
  created_at?: string;
  updated_at?: string;
}

export interface StorioInformationService {
  id: number;
  title?: string;
  address?: string;
  responsible_person?: string;
  designation?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  photo?: number;
  photo_url?: string;
  office_hours?: string;
  description?: string;
  services_offered?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface StorioComplaintOfficer {
  id: number;
  name: string;
  designation?: string;
  address?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  photo?: number;
  photo_url?: string;
  description?: string;
  complaint_process?: string;
  office_hours?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StorioHotline {
  id: number;
  title: string;
  number: string;
  description?: string;
  category?: string;
  is_emergency?: boolean;
  order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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
   // Static data (institution profile, customization): revalidate daily
   const profile = await storio.getInstitutionProfile({ next: { revalidate: 86400 } });

   // High-velocity data (notices, blogs): revalidate every 60 seconds
   const notices = await storio.getNotices({ next: { revalidate: 60 } });
   ```
3. **Graceful Degradation:** The SDK never throws uncaught exceptions on network errors; it returns `null` or empty collections and logs informative warnings in development. Always write clean null-check fallbacks.

---

## 6. Next.js App Router Implementation Guide & Examples

### Example 1: Complete Server Homepage (`src/app/page.tsx`)

```tsx
import { headers } from 'next/headers';
import { storio, StorioLayoutResponse, StorioHeroSlide, StorioNotice } from '@storio/template-sdk';
import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';

export default async function HomePage() {
  // 1. RESOLVE HOST FROM REQUEST HEADERS
  const headersList = await headers();
  const rawHost: string = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host: string = rawHost.split(':')[0];

  // 2. CHECK FOR LINKED TENANT (CLI) VS STANDALONE PREVIEW MODE
  const linkedTenant = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isStandalone = isLocalHost && !linkedTenant;
  const tenantHost = linkedTenant || (isStandalone ? 'demo.storio.cloud' : host);

  // 3. FETCH REAL TENANT DATA VIA SDK
  const [rawLayout, rawHeroSlides, rawNotices] = await Promise.all([
    storio.getLayout(tenantHost),
    storio.getHeroSlides(tenantHost),
    storio.getNotices(tenantHost),
  ]);

  // 4. APPLY THE GOLDEN RULE (Standalone Demo Data vs Tenant DB Real Data)
  const layout: StorioLayoutResponse | null = rawLayout || (isStandalone ? DEFAULT_DEMO_DATA.layout : null);

  const heroSlides: StorioHeroSlide[] = (Array.isArray(rawHeroSlides) && rawHeroSlides.length > 0)
    ? rawHeroSlides
    : (isStandalone ? DEFAULT_DEMO_DATA.heroSlides : []);

  const notices: StorioNotice[] = (Array.isArray(rawNotices) && rawNotices.length > 0)
    ? rawNotices
    : (isStandalone ? DEFAULT_DEMO_DATA.notices : []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header Bar */}
      <header className="p-4 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {layout?.settings?.logo_url && (
            <img src={layout.settings.logo_url} alt="Logo" className="h-10 w-auto" />
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {layout?.settings?.site_title || "Emerald Campus"}
          </h1>
        </div>
        <nav className="flex space-x-4">
          {layout?.navigation?.items?.map((item) => (
            <a key={item.id || item.url} href={item.url} className="text-gray-700 hover:text-emerald-600 font-medium">
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero Carousel */}
      <section className="bg-emerald-800 text-white p-12 text-center">
        {heroSlides.length > 0 ? (
          <div>
            <h2 className="text-4xl font-extrabold">{heroSlides[0].title}</h2>
            <p className="mt-2 text-lg text-emerald-100">{heroSlides[0].subtitle}</p>
            {heroSlides[0].button_text && (
              <a 
                href={heroSlides[0].button_url || '#'} 
                className="mt-6 inline-block bg-amber-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-amber-400"
              >
                {heroSlides[0].button_text}
              </a>
            )}
          </div>
        ) : (
          <div className="p-8 text-emerald-200">No banner slides configured.</div>
        )}
      </section>

      {/* Notice Board */}
      <section className="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-lg shadow">
        <h3 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-4">Notice Board</h3>
        
        {notices.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notices.map((notice) => (
              <li key={notice.id} className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{notice.title}</h4>
                  <p className="text-sm text-gray-500">{notice.published_date}</p>
                </div>
                {notice.attachment_url && (
                  <a 
                    href={notice.attachment_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700"
                  >
                    Download PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-gray-500 bg-gray-50 rounded">
            No announcements or notices posted at this time.
          </div>
        )}
      </section>
    </div>
  );
}
```

---

### Example 2: Dynamic Blog Detail Server Page (`src/app/blog/[slug]/page.tsx`)

```tsx
import { storio, StorioBlogPost } from '@storio/template-sdk';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;

  // 1. Resolve Host from Request Headers
  const headersList = await headers();
  const rawHost: string = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host: string = rawHost.split(':')[0];

  // 2. Check for Linked Tenant (CLI) vs Standalone Mode
  const linkedTenant = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isStandalone = isLocalHost && !linkedTenant;
  const tenantHost = linkedTenant || (isStandalone ? 'demo.storio.cloud' : host);

  // 3. Fetch Real Tenant Article via SDK
  const rawArticle: StorioBlogPost | null = await storio.getBlogDetail(slug, tenantHost);

  // 4. Apply Golden Rule (Fallback to Demo Data ONLY in Standalone Preview mode)
  const article: StorioBlogPost | null = rawArticle || (
    isStandalone 
      ? DEFAULT_DEMO_DATA.blogs?.find((b: StorioBlogPost) => b.slug === slug) || DEFAULT_DEMO_DATA.blogs?.[0] || null
      : null
  );

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold text-gray-900">{article.title}</h1>
      <p className="mt-2 text-gray-500">{article.published_at}</p>
      
      {article.featured_image_url && (
        <img 
          src={article.featured_image_url} 
          alt={article.title} 
          className="my-6 w-full h-80 object-cover rounded-lg" 
        />
      )}

      <div 
        className="prose max-w-none mt-6" 
        dangerouslySetInnerHTML={{ __html: article.content || article.summary || '' }} 
      />
    </article>
  );
}
```

---

### Example 3: Client Form Submission Component (`src/components/ContactForm.tsx`)

Strict TypeScript implementation with zero `any` types:

```tsx
'use client';

import React, { useState } from 'react';
import { storio, StorioContactFormResponse } from '@storio/template-sdk';

export default function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    
    // Strict typing using Record<string, unknown> instead of any
    const payload: Record<string, unknown> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    const res: StorioContactFormResponse | null = await storio.submitContactMessage(payload);
    
    setIsSubmitting(false);

    if (res?.success) {
      setStatus('Message sent successfully!');
      e.currentTarget.reset();
    } else {
      setStatus(res?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input 
          name="name" 
          type="text" 
          required 
          className="mt-1 w-full border p-2 rounded focus:ring-emerald-500 focus:border-emerald-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input 
          name="email" 
          type="email" 
          required 
          className="mt-1 w-full border p-2 rounded focus:ring-emerald-500 focus:border-emerald-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea 
          name="message" 
          rows={4} 
          required 
          className="mt-1 w-full border p-2 rounded focus:ring-emerald-500 focus:border-emerald-500" 
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-emerald-600 text-white font-medium py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>

      {status && (
        <p className={`mt-2 text-sm text-center ${status.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
    </form>
  );
}
```

---

### Example 4: Academics Routine & Syllabus Page (`src/app/academics/page.tsx`)

```tsx
import { headers } from 'next/headers';
import { storio, StorioClassRoutine, StorioSyllabus } from '@storio/template-sdk';

export default async function AcademicsPage() {
  const headersList = await headers();
  const rawHost = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host = rawHost.split(':')[0];

  const linkedTenant = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isStandalone = isLocalHost && !linkedTenant;
  const tenantHost = linkedTenant || (isStandalone ? 'demo.storio.cloud' : host);

  const [routines, syllabuses] = await Promise.all([
    storio.getClassRoutines(tenantHost),
    storio.getSyllabuses(tenantHost),
  ]);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Academic Routines & Syllabuses</h1>

      {/* Class Routines */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Class Timetables</h2>
        {routines && routines.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {routines.map((r) => (
              <div key={r.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{r.class_name} {r.section ? `(${r.section})` : ''}</h3>
                  <p className="text-sm text-gray-500">Shift: {r.shift || 'General'} | Year: {r.academic_year}</p>
                </div>
                {r.routine_file && (
                  <a href={r.routine_file} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm">
                    PDF Routine
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No class routines published yet.</p>
        )}
      </section>

      {/* Syllabuses */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Curriculum Syllabuses</h2>
        {syllabuses && syllabuses.length > 0 ? (
          <div className="divide-y border rounded-lg bg-white">
            {syllabuses.map((s) => (
              <div key={s.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{s.class_name} — {s.exam_type}</h3>
                  <p className="text-sm text-gray-500">{s.description || `Academic Session ${s.academic_year}`}</p>
                </div>
                {s.file_url && (
                  <a href={s.file_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm">
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No syllabuses published yet.</p>
        )}
      </section>
    </div>
  );
}
```

---

### Example 5: Citizen Charter & Compliance Page (`src/app/compliance/page.tsx`)

```tsx
import { headers } from 'next/headers';
import { storio, StorioInformationService, StorioComplaintOfficer, StorioHotline } from '@storio/template-sdk';

export default async function CompliancePage() {
  const headersList = await headers();
  const rawHost = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host = rawHost.split(':')[0];

  const linkedTenant = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isStandalone = isLocalHost && !linkedTenant;
  const tenantHost = linkedTenant || (isStandalone ? 'demo.storio.cloud' : host);

  const [infoService, complaintOfficer, hotlines] = await Promise.all([
    storio.getInformationService(tenantHost),
    storio.getComplaintOfficer(tenantHost),
    storio.getHotlines(tenantHost),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Institutional Governance & Citizen Charter</h1>

      {/* RTI Officer */}
      {infoService?.officer_name && (
        <section className="p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Right to Information (RTI) Officer</h2>
          <p className="font-medium text-gray-900">{infoService.officer_name}</p>
          <p className="text-sm text-gray-600">{infoService.designation}</p>
          <p className="text-sm text-gray-500 mt-2">Email: {infoService.email} | Phone: {infoService.phone}</p>
        </section>
      )}

      {/* Grievance Redress Officer */}
      {complaintOfficer?.officer_name && (
        <section className="p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Grievance Redress System (GRS)</h2>
          <p className="font-medium text-gray-900">{complaintOfficer.officer_name}</p>
          <p className="text-sm text-gray-600">{complaintOfficer.designation}</p>
          <div className="mt-4 space-y-2">
            {complaintOfficer.steps?.map((step) => (
              <div key={step.step_number} className="text-sm">
                <span className="font-semibold">Step {step.step_number}: {step.title}</span> — {step.description}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Emergency Hotlines */}
      {hotlines && hotlines.length > 0 && (
        <section className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h2 className="text-xl font-bold text-emerald-900 mb-4">Emergency Hotlines</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hotlines.map((h) => (
              <div key={h.id} className="p-3 bg-white rounded border border-emerald-100 shadow-sm text-center">
                <p className="text-2xl font-black text-emerald-700">{h.number}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">{h.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```
