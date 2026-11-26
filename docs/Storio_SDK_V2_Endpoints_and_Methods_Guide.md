# Storio Template SDK (v2) — Comprehensive Developer API & Data Reference Manual

> **Last Updated:** November 26, 2026 | **SDK Version:** `@storio/template-sdk@1.0.1` | **Platform:** Storio CMS v2

Welcome 3rd-party template developers!

This is the **complete, official API and Data Payload reference manual** for `@storio/template-sdk`. Because third-party template repositories do not include the Storio backend source code, every SDK method, backend endpoint, query parameter, TypeScript interface, and verified JSON payload structure is documented in full below.

---

## Table of Contents

- [1. Quick Start & Setup](#1-quick-start--setup)
  - [Importing the SDK](#importing-the-sdk)
  - [Key SDK Capabilities](#key-sdk-capabilities)
  - [Fetching Live Database Data with Storio CLI](#fetching-live-database-data-with-storio-cli)
  - [Mandatory Rules for Template Developers](#mandatory-rules-for-template-developers)
- [2. Complete SDK Method & Endpoint Index (58 Methods)](#2-complete-sdk-method--endpoint-index-58-methods)
- [3. Detailed Method & Data Payload Reference](#3-detailed-method--data-payload-reference)
  - [Section 1: Site Identity, Layout, Profile & Feature Cards (Methods 1–6)](#section-1-site-identity-layout-profile--feature-cards)
  - [Section 2: Hero Carousel Banners (Method 7)](#section-2-hero-carousel-banners)
  - [Section 3: Public Notice Board & Announcements (Methods 8–9)](#section-3-public-notice-board--announcements)
  - [Section 4: Blogs, Categories & News Articles (Methods 10–12)](#section-4-blogs-categories--news-articles)
  - [Section 5: Faculty, Staff & Board Directory (Methods 13–14)](#section-5-faculty-staff--board-directory)
  - [Section 6: Media Gallery & Photo Albums (Methods 15–16)](#section-6-media-gallery--photo-albums)
  - [Section 7: School Activities, Events & Categories (Methods 17–22)](#section-7-school-activities-events--categories)
  - [Section 8: Dynamic CMS Custom Builder Pages (Methods 23–24)](#section-8-dynamic-cms-custom-builder-pages)
  - [Section 9: Social Proof, Leadership & Promotions (Methods 25–29)](#section-9-social-proof-leadership--promotions)
  - [Section 10: Quick Links, FAQs, Videos, Calendar & Exam Results (Methods 30–35)](#section-10-quick-links-faqs-videos-calendar--exam-results)
  - [Section 11: Careers & Recruitment (Methods 36–37)](#section-11-careers--recruitment)
  - [Section 12: National Education Board Notice Sync (Method 38)](#section-12-national-education-board-notice-sync)
  - [Section 13: Online Admission Portal & Contact Form (Methods 39–43)](#section-13-online-admission-portal--contact-form)
  - [Section 14: Dynamic Form Builder (Methods 44–47)](#section-14-dynamic-form-builder)
  - [Section 15: Academics (Methods 48–51)](#section-15-academics)
  - [Section 16: Citizen Charter & Institutional Compliance (Methods 52–55)](#section-16-citizen-charter--institutional-compliance)
  - [Section 17: Dynamic Custom Collections & Core Fetcher (Methods 56–58)](#section-17-dynamic-custom-collections--core-fetcher)
- [4. Complete TypeScript Type Definitions](#4-complete-typescript-type-definitions)
- [5. Architectural Best Practices, Caching & Error Handling](#5-architectural-best-practices-caching--error-handling)
- [6. Next.js App Router Implementation Guide & Examples](#6-nextjs-app-router-implementation-guide--examples)

---

## 1. Quick Start & Setup

### Importing the SDK

Install the `@storio/template-sdk` package in your template repository (from your starter template tarball or registry):

```bash
npm install @storio/template-sdk
```

Import the singleton instance `storio` or specific TypeScript models anywhere in your server or client components:

```typescript
import { storio, StorioLayoutResponse, StorioNotice, StorioBlogPost } from '@storio/template-sdk';
```

### Key SDK Capabilities

- **Automatic Multi-Tenant Resolution:** Detects tenant context automatically from `NEXT_PUBLIC_STORIO_TENANT_HOST` / `STORIO_TENANT_HOST` or incoming HTTP request headers (`x-tenant-host`, `Host`).
- **Environment-Aware Routing:** In browser production, routes requests to `window.location.origin` so `/api/*` goes through the Storio gateway; on the server, uses `BACKEND_INTERNAL_URL` / `NEXT_PUBLIC_API_URL` / `http://127.0.0.1:8000`.
- **Edge & Next.js ISR/SSR Ready:** Built on native web `fetch`, defaulting `GET` requests to `{ next: { revalidate: 60 } }` (customizable per call via `StorioFetchOptions`).
- **Error Handling Control:** Returns `null` cleanly by default on HTTP/network errors, or throws a typed `StorioAPIError` when `{ throwOnError: true }` is passed.
- **Complete Coverage:** 58 public methods covering layout, theme customization, navigation, notices, blogs, activities, events, pages, dynamic forms, admissions, academics, compliance, and custom collections.

---

### Fetching Live Database Data with Storio CLI

Template developers can connect their local preview environment to live production or development tenant databases using the Storio CLI:

```bash
# 1. Authenticate with Storio
storio login
# (Local backend: storio login --api-url http://localhost:8000)

# 2. Link template to a tenant database (writes NEXT_PUBLIC_STORIO_TENANT_HOST to .env.local)
storio link
# (Local backend: storio link --api-url http://localhost:8000)

# 3. Start Next.js with linked tenant context
storio dev

# 4. Return to unlinked standalone preview mode
storio unlink
```

---

### Mandatory Rules for Template Developers

#### Rule 1: Tenant DB vs. Standalone Preview Mock Data Rule

When a customer installs a template into their live tenant, their database starts empty or contains only their own populated records.

> [!IMPORTANT]
> **The Golden Data Fallback Rule:**
> 1. When running on a live tenant domain (or linked via `storio link` / `NEXT_PUBLIC_STORIO_TENANT_HOST`), the template **MUST render actual database data**. If a database table is empty (e.g. `0` notices or `[]`), render a clean empty state or hide the section gracefully. **NEVER fall back to demo/mock data in live tenant mode.**
> 2. When running in unlinked local preview mode (`localhost` / `127.0.0.1` without `NEXT_PUBLIC_STORIO_TENANT_HOST`), the template **MUST fall back to default demo data** so prospective buyers can preview the template design.

#### Rule 2: Strict Typing & Paginated List Handling

- Always import exported interfaces from `@storio/template-sdk` rather than using `any`.
- **Important Note on Paginated Endpoints:** A small number of backend ViewSets (`/api/events/`, `/api/event-categories/`, `/api/institution-profile/cards/`) return DRF paginated objects `{ count, next, previous, results: [...] }` rather than a flat JSON array `[...]`. Always unwrap list responses defensively using a helper:

```typescript
export function unwrapList<T>(res: T[] | { results?: T[] } | null | undefined): T[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}
```

#### Rule 3: Passing Filter Parameters + Fetch Options

Filterable list methods (`getNotices`, `getBlogs`, `getActivities`, `getCareers`, `getEvents`, `getExamResults`) support all three calling styles for full backward compatibility:

```typescript
// 1. No filters, host string
await storio.getNotices('school.localhost');

// 2. Filters + host string (or StorioFetchOptions)
await storio.getNotices({ search: 'exam', status: 'published' }, { tenantHost: 'school.localhost', next: { revalidate: 0 } });

// 3. Combined object
await storio.getNotices({ search: 'exam', tenantHost: 'school.localhost', next: { revalidate: 0 } });
```

---

## 2. Complete SDK Method & Endpoint Index (58 Methods)

| # | SDK Method Signature | HTTP | Endpoint Path | Query Parameters / Body | Return Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `storio.getSettings(hostOrOpts?)` | `GET` | `/api/v2/template/settings/` | None | `Promise<StorioSettingsResponse \| null>` |
| 2 | `storio.getCustomization(hostOrOpts?)` | `GET` | `/api/v2/template/customization/` | None *(recommend `revalidate: 0`)* | `Promise<StorioCustomizationResponse \| null>` |
| 3 | `storio.getNavigation(hostOrOpts?)` | `GET` | `/api/v2/template/navigation/` | None *(recommend `revalidate: 0`)* | `Promise<StorioNavigationResponse \| null>` |
| 4 | `storio.getLayout(hostOrOpts?)` | `GET` | `/api/v2/template/layout/` | None *(recommend `revalidate: 0`)* | `Promise<StorioLayoutResponse \| null>` |
| 5 | `storio.getInstitutionProfile(hostOrOpts?)` | `GET` | `/api/v2/template/institution-profile/` | None | `Promise<StorioInstitutionProfile \| null>` |
| 6 | `storio.getInstitutionCards(hostOrOpts?)` | `GET` | `/api/institution-profile/cards/` | None *(paginated `.results`)* | `Promise<StorioInstitutionCard[] \| null>` |
| 7 | `storio.getHeroSlides(hostOrOpts?)` | `GET` | `/api/v2/template/hero-slides/` | None | `Promise<StorioHeroSlide[] \| null>` |
| 8 | `storio.getNotices(paramsOrOpts?, opts?)` | `GET` | `/api/v2/template/notices/` | `search`, `status` | `Promise<StorioNotice[] \| null>` |
| 9 | `storio.getNoticeDetail(id, hostOrOpts?)` | `GET` | `/api/v2/template/notices/${id}/` | None | `Promise<StorioNotice \| null>` |
| 10 | `storio.getBlogs(paramsOrOpts?, opts?)` | `GET` | `/api/v2/template/blogs/` | `search`, `category` | `Promise<StorioBlogPost[] \| null>` |
| 11 | `storio.getBlogCategories(hostOrOpts?)` | `GET` | `/api/v2/template/blogs/categories/` | None | `Promise<StorioBlogCategory[] \| null>` |
| 12 | `storio.getBlogDetail(slug, hostOrOpts?)` | `GET` | `/api/v2/template/blogs/${slug}/` | None | `Promise<StorioBlogPost \| null>` |
| 13 | `storio.getStaff(hostOrOpts?)` | `GET` | `/api/v2/template/staff/` | None | `Promise<StorioStaffMember[] \| null>` |
| 14 | `storio.getTeam(hostOrOpts?)` | `GET` | `/api/v2/template/team/` | None | `Promise<StorioTeamMember[] \| null>` |
| 15 | `storio.getGallery(hostOrOpts?)` | `GET` | `/api/v2/template/gallery/` | None | `Promise<StorioGalleryItem[] \| null>` |
| 16 | `storio.getAlbums(hostOrOpts?)` | `GET` | `/api/v2/template/albums/` | None | `Promise<StorioAlbum[] \| null>` |
| 17 | `storio.getActivities(paramsOrOpts?, opts?)` | `GET` | `/api/v2/template/activities/` | `search`, `category` | `Promise<StorioActivityItem[] \| null>` |
| 18 | `storio.getActivityCategories(hostOrOpts?)` | `GET` | `/api/v2/template/activities/categories/` | None | `Promise<StorioActivityCategory[] \| null>` |
| 19 | `storio.getActivityDetail(slug, hostOrOpts?)` | `GET` | `/api/v2/template/activities/${slug}/` | None | `Promise<StorioActivityItem \| null>` |
| 20 | `storio.getEvents(paramsOrOpts?, opts?)` | `GET` | `/api/events/` | `status`, `categories`, `is_featured`, `search`, `ordering` *(paginated `.results`)* | `Promise<StorioEvent[] \| null>` |
| 21 | `storio.getEventCategories(hostOrOpts?)` | `GET` | `/api/event-categories/` | None *(paginated `.results`)* | `Promise<StorioEventCategory[] \| null>` |
| 22 | `storio.getEventDetail(slugOrId, hostOrOpts?)` | `GET` | `/api/events/${slugOrId}/` | None | `Promise<StorioEvent \| null>` |
| 23 | `storio.getPages(hostOrOpts?)` | `GET` | `/api/v2/template/pages/` | None | `Promise<StorioCustomPage[] \| null>` |
| 24 | `storio.getPageBySlug(slug, hostOrOpts?)` | `GET` | `/api/v2/template/pages/by-slug/${slug}/` | None | `Promise<StorioCustomPage \| null>` |
| 25 | `storio.getTestimonials(hostOrOpts?)` | `GET` | `/api/v2/template/testimonials/` | None | `Promise<StorioTestimonial[] \| null>` |
| 26 | `storio.getLeadershipMessages(hostOrOpts?)` | `GET` | `/api/v2/template/leadership-messages/` | None | `Promise<StorioLeadershipMessage[] \| null>` |
| 27 | `storio.getPromotions(hostOrOpts?)` | `GET` | `/api/v2/template/promotions/` | None | `Promise<StorioPromotion[] \| null>` |
| 28 | `storio.getPromotionDetail(id, hostOrOpts?)` | `GET` | `/api/v2/template/promotions/${id}/` | None | `Promise<StorioPromotion \| null>` |
| 29 | `storio.trackPromotionClick(id, hostOrOpts?)` | `POST` | `/api/promotions/${id}/click/` | None | `Promise<StorioPromotionClickResponse \| null>` |
| 30 | `storio.getImportantLinks(hostOrOpts?)` | `GET` | `/api/v2/template/important-links/` | None | `Promise<StorioImportantLink[] \| null>` |
| 31 | `storio.getFaqs(hostOrOpts?)` | `GET` | `/api/v2/template/faqs/` | None | `Promise<StorioFaq[] \| null>` |
| 32 | `storio.getVideos(hostOrOpts?)` | `GET` | `/api/v2/template/reels/` | None | `Promise<StorioVideoItem[] \| null>` |
| 33 | `storio.getCalendarEvents(hostOrOpts?)` | `GET` | `/api/v2/template/calendar/` | None | `Promise<StorioCalendarEvent[] \| null>` |
| 34 | `storio.getCalendarSettings(hostOrOpts?)` | `GET` | `/api/calendar/settings/` | None | `Promise<StorioCalendarSetting \| null>` |
| 35 | `storio.getExamResults(paramsOrOpts?, opts?)` | `GET` | `/api/v2/template/exam-results/` | `exam_type` | `Promise<StorioExamResult[] \| null>` |
| 36 | `storio.getCareers(paramsOrOpts?, opts?)` | `GET` | `/api/v2/template/careers/jobs/` | `location` | `Promise<StorioCareer[] \| null>` |
| 37 | `storio.getJobDetail(slug, hostOrOpts?)` | `GET` | `/api/v2/template/careers/jobs/${slug}/` | None | `Promise<StorioCareer \| null>` |
| 38 | `storio.getBoardNotices(hostOrOpts?)` | `GET` | `/api/v2/template/board-notices/` | None | `Promise<StorioBoardNotice[] \| null>` |
| 39 | `storio.getAdmissionFormConfig(hostOrOpts?)` | `GET` | `/api/v2/template/admission/form-config/current/` | None | `Promise<StorioAdmissionFormConfig \| null>` |
| 40 | `storio.sendAdmissionOTP(email, phone?, opts?)` | `POST` | `/api/v2/template/admission/send-otp/` | Body: `{ email, phone? }` | `Promise<StorioAdmissionOTPResponse \| null>` |
| 41 | `storio.verifyAdmissionOTP(email, otp, opts?)` | `POST` | `/api/v2/template/admission/verify-otp/` | Body: `{ email, otp_code }` | `Promise<StorioAdmissionOTPResponse \| null>` |
| 42 | `storio.submitAdmissionApplication(data, otp, opts?)` | `POST` | `/api/v2/template/admission/applications/` | Body: `{ form_data, otp_code }` | `Promise<StorioAdmissionApplicationResponse \| null>` |
| 43 | `storio.submitContactMessage(data, hostOrOpts?)` | `POST` | `/api/v2/template/contact/` | Body: `{ name, email, mobile, subject, message, recaptcha_token? }` | `Promise<StorioContactFormResponse \| null>` |
| 44 | `storio.getForms(hostOrOpts?)` | `GET` | `/api/v2/template/forms/` | None | `Promise<StorioForm[] \| null>` |
| 45 | `storio.getForm(code, hostOrOpts?)` | `GET` | `/api/v2/template/forms/${code}/` | None *(defaults `revalidate: 0`)* | `Promise<StorioForm \| null>` |
| 46 | `storio.uploadFormFile(code, file, fieldId?, opts?)` | `POST` | `/api/v2/template/forms/${code}/upload/` | `multipart/form-data` (`file`, `field_id?`) | `Promise<StorioFormUploadResponse \| null>` |
| 47 | `storio.submitFormResponse(payload, hostOrOpts?)` | `POST` | `/api/v2/template/forms/submit/` | Body: `{ form, answers }` | `Promise<StorioFormSubmitResponse \| null>` |
| 48 | `storio.getClassRoutines(hostOrOpts?)` | `GET` | `/api/v2/template/academic/class-routines/` | None | `Promise<StorioClassRoutine[] \| null>` |
| 49 | `storio.getSyllabuses(hostOrOpts?)` | `GET` | `/api/v2/template/academic/syllabuses/` | None | `Promise<StorioSyllabus[] \| null>` |
| 50 | `storio.getStudentStats(params?, hostOrOpts?)` | `GET` | `/api/v2/template/student-stats/` | `year`, `program` | `Promise<StorioStudentStatsResponse \| null>` |
| 51 | `storio.getAcademicPrograms(hostOrOpts?)` | `GET` | `/api/v2/template/academic/programs/` | None | `Promise<StorioAcademicProgram[]>` |
| 52 | `storio.getMpoInfo(hostOrOpts?)` | `GET` | `/api/v2/template/mpo-info/` | None | `Promise<StorioMpoInfo \| null>` |
| 53 | `storio.getInformationService(hostOrOpts?)` | `GET` | `/api/v2/template/information-service/` | None | `Promise<StorioInformationService \| null>` |
| 54 | `storio.getComplaintOfficer(hostOrOpts?)` | `GET` | `/api/v2/template/complaint-officer/` | None | `Promise<StorioComplaintOfficer \| null>` |
| 55 | `storio.getHotlines(hostOrOpts?)` | `GET` | `/api/v2/template/hotlines/` | None | `Promise<StorioHotline[] \| null>` |
| 56 | `storio.getCollection<T>(slug, options?)` | `GET` | `/api/v2/collections/${slug}/` | `page`, `pageSize`, `sortBy`, `expand` | `Promise<StorioCollectionResponse<T> \| null>` |
| 57 | `storio.getCollectionItem<T>(slug, itemId, opts?)` | `GET` | `/api/v2/collections/${slug}/${itemId}/` | `expand` | `Promise<StorioCollectionItem<T> \| null>` |
| 58 | `storio.apiFetch<T>(endpoint, options?)` | `ANY` | `*` | Custom `StorioFetchOptions` | `Promise<T \| null>` |

---

## 3. Detailed Method & Data Payload Reference

### Section 1: Site Identity, Layout, Profile & Feature Cards

#### 1. `storio.getSettings(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/settings/`
- **Method Signature:** `storio.getSettings(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioSettingsResponse | null>`
- **Description:** Returns public site settings (title, tagline, logo, favicon, contact info, analytics IDs, hCaptcha site key, and social links).
- **Verified JSON Response Shape:**
  ```json
  {
    "site_title": "Greenwood International Academy",
    "site_tagline": "Excellence in Education",
    "logo_url": "https://tenant.storio.cloud/media/branding/logo.png",
    "favicon_url": "https://tenant.storio.cloud/media/branding/favicon.ico",
    "contact_email": "info@example.edu",
    "phone_number": "+880 1700-000000",
    "mobile_number": "+880 1800-000000",
    "social_links": [
      { "platform": "facebook", "url": "https://facebook.com/exampleacademy" },
      { "platform": "youtube", "url": "https://youtube.com/@exampleacademy" }
    ],
    "mailing_address": "123 Academic Road, Dhaka-1205",
    "google_analytics_id": "G-XXXXXXXXXX",
    "google_tag_manager_id": "GTM-XXXXXXX",
    "hcaptcha_site_key": "10000000-ffff-ffff-ffff-000000000001"
  }
  ```

#### 2. `storio.getCustomization(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/customization/`
- **Method Signature:** `storio.getCustomization(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCustomizationResponse | null>`
- **Description:** Returns the active theme configuration object (`config`) defined by your template's `public/storio.template.json` manifest (colors, fonts, layout flags, and `navbarLinks`).
- **Caching Tip:** Pass `{ tenantHost, next: { revalidate: 0 } }` so published dashboard theme/menu updates reflect immediately.
- **Verified JSON Response Shape:**
  ```json
  {
    "config": {
      "primaryColor": "#0e704b",
      "secondaryColor": "#1e293b",
      "headingFont": "Plus Jakarta Sans",
      "showHero": true,
      "navbarLinks": [
        { "id": "1", "name": "Home", "href": "/" }
      ]
    }
  }
  ```

#### 3. `storio.getNavigation(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/navigation/`
- **Method Signature:** `storio.getNavigation(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNavigationResponse | null>`
- **Description:** Returns the header/navigation links configured in **Menu Management** or **Theme Settings → Navigation Menu**.
- **Field Compatibility Tip:** Dashboard Menu Management saves items using `name`, `href`, and `subLinks` (with optional `isVisible`). Support `item.name || item.label`, `item.href || item.url`, and `item.subLinks || item.children`.
- **Verified JSON Response Shape:**
  ```json
  {
    "items": [
      { "id": "1", "name": "Home", "href": "/" },
      {
        "id": "2",
        "name": "About Us",
        "href": "#",
        "isVisible": true,
        "subLinks": [
          { "id": "2-1", "name": "Institution Profile", "href": "/about/institution" },
          { "id": "2-2", "name": "Administrators", "href": "/about/administrator" }
        ]
      },
      { "id": "3", "name": "Notice", "href": "/notice" },
      { "id": "4", "name": "Contact", "href": "/contact" }
    ]
  }
  ```

#### 4. `storio.getLayout(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/layout/`
- **Method Signature:** `storio.getLayout(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioLayoutResponse | null>`
- **Description:** Combined endpoint returning `settings`, `customization`, and `navigation` in one request — ideal for root `layout.tsx`.
- **Verified JSON Response Shape:**
  ```json
  {
    "settings": {
      "site_title": "Greenwood International Academy",
      "site_tagline": "Excellence in Education",
      "logo_url": "https://tenant.storio.cloud/media/branding/logo.png",
      "favicon_url": "https://tenant.storio.cloud/media/branding/favicon.ico",
      "contact_email": "info@example.edu",
      "phone_number": "+880 1700-000000",
      "social_links": [
        { "platform": "facebook", "url": "https://facebook.com/exampleacademy" }
      ],
      "mailing_address": "123 Academic Road, Dhaka-1205"
    },
    "customization": {
      "config": {
        "primaryColor": "#0e704b",
        "navbarLinks": [
          { "id": "1", "name": "Home", "href": "/" }
        ]
      }
    },
    "navigation": {
      "items": [
        { "id": "1", "name": "Home", "href": "/" }
      ]
    }
  }
  ```

#### 5. `storio.getInstitutionProfile(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/institution-profile/`
- **Method Signature:** `storio.getInstitutionProfile(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioInstitutionProfile | null>`
- **Description:** Returns institutional profile metadata (EIIN, school code, shift, location hierarchy, mission, vision, metrics, and board recognition details).
- **Verified JSON Response Shape:**
  ```json
  {
    "id": 1,
    "institution_image": 5,
    "institution_image_url": "/media/uploads/campus.webp",
    "eiin": 123456,
    "school_code": "SCH-1001",
    "school_shift": "Morning & Day",
    "school_type": "Boys & Girls",
    "division": "Dhaka",
    "district": "Dhaka",
    "upazila": "Dhanmondi",
    "ward_no": "15",
    "school_details": "Founded in 1995 to deliver modern academic excellence.",
    "additional_info": [
      { "label": "Campus Area", "value": "3.5 Acres" },
      { "label": "Science Labs", "value": "4" }
    ],
    "important_links": [
      { "id": 1, "title": "Education Board Portal", "url": "https://dhakaeducationboard.gov.bd", "order": 1 }
    ],
    "key_metrics": [
      { "label": "Pass Rate", "value": "99.5%" }
    ],
    "metrics_title": "Our Key Achievements",
    "total_students": 1850,
    "total_teachers": 92,
    "total_students_label": "Total Students",
    "total_teachers_label": "Total Teachers",
    "mission": "To nurture curious minds and strong character.",
    "vision": "To empower students for global leadership.",
    "education_board": "Dhaka",
    "recognition_levels": ["Junior Secondary", "Secondary", "Higher Secondary"],
    "academic_recognition": [
      { "id": 1, "level": "Secondary", "recognition_type": "Permanent", "valid_until": "2030-12-31", "order_number": "GOV-2026-101" }
    ],
    "recognition_documents": [
      { "id": 1, "title": "Recognition Certificate", "file_url": "/media/uploads/recognition.pdf", "issue_date": "2024-06-15" }
    ],
    "created_at": "2026-01-10T09:00:00Z",
    "updated_at": "2026-11-20T12:00:00Z"
  }
  ```

#### 6. `storio.getInstitutionCards(tenantHostOrOptions?)` *(New)*
- **Endpoint:** `GET /api/institution-profile/cards/`
- **Method Signature:** `storio.getInstitutionCards(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioInstitutionCard[] | null>`
- **Description:** Returns institutional highlight/feature cards configured under Dashboard → Institution Profile → Cards.
- **Note:** This endpoint returns a DRF paginated object `{ count, next, previous, results: [...] }`. Use `unwrapList(res)` before mapping.
- **Verified JSON Response Shape:**
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "institution_profile": 1,
        "title": "Modern ICT Laboratory",
        "description": "Equipped with 60 high-speed workstations and robotics kits.",
        "icon": "laptop",
        "image": 12,
        "image_url": "/media/uploads/ict_lab.webp",
        "order": 0,
        "created_at": "2026-08-01T10:00:00Z",
        "updated_at": "2026-08-01T10:00:00Z"
      }
    ]
  }
  ```

---

### Section 2: Hero Carousel Banners

#### 7. `storio.getHeroSlides(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/hero-slides/`
- **Method Signature:** `storio.getHeroSlides(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioHeroSlide[] | null>`
- **Description:** Returns active homepage hero carousel slides sorted by `order`.
- **Field Note:** Live backend responses use `heading`, `subheading`, `buttonText`, `buttonLink`, `bgType`, `bgImage_data`, and `bgImage_url`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "heading": "Admissions Open 2026",
      "subheading": "Discover a future-ready curriculum built for holistic growth.",
      "buttonText": "Apply Now",
      "buttonLink": "/admission",
      "bgType": "image",
      "bgImage": 36,
      "bgImage_data": {
        "id": 36,
        "file": "/media/uploads/hero_banner.webp",
        "file_name": "hero_banner.webp",
        "title": "Main Campus",
        "alt_text": "Campus courtyard view"
      },
      "bgImage_url": null,
      "bgColor": "#0e704b",
      "gradientFrom": "#0e704b",
      "gradientTo": "#064e3b",
      "gradientDir": "to right",
      "textPosition": "center",
      "headingColor": "#ffffff",
      "subheadingColor": "#e2e8f0",
      "buttonColor": "#f59e0b",
      "buttonTextColor": "#0f172a",
      "status": "active",
      "order": 1,
      "create_date": "2026-07-09T09:52:03Z",
      "update_date": "2026-07-09T09:52:03Z"
    }
  ]
  ```

---

### Section 3: Public Notice Board & Announcements

#### 8. `storio.getNotices(paramsOrOptions?, tenantHostOrOptions?)` *(Updated with Query Filters)*
- **Endpoint:** `GET /api/v2/template/notices/`
- **Method Signature:** `storio.getNotices(paramsOrOptions?: ({ search?: string; status?: string } & StorioFetchOptions) | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNotice[] | null>`
- **Description:** Returns published announcements and circulars.
- **Query Parameters Supported:**
  - `search` (`string`): Case-insensitive match against `title` and `content`.
  - `status` (`string`): Notice status (`published`, `draft`, `schedule`, `archived`, `binned`; unauthenticated public calls only expose `published`).
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Annual Sports Meet Schedule 2026",
      "content": "<p>All students are requested to assemble by 8:30 AM.</p>",
      "status": "published",
      "publish_date": "2026-08-25T07:07:13Z",
      "pdf_view_mode": false,
      "attachments": [12],
      "attachments_detail": [
        {
          "id": 12,
          "file": "/media/uploads/sports_schedule.pdf",
          "file_type": "document",
          "file_name": "sports_schedule.pdf",
          "file_size": 245760,
          "file_size_display": "240.00 KB",
          "alt_text": "Sports Meet Circular",
          "uploaded_by": "admin",
          "create_date": "2026-08-25T07:05:00Z",
          "update_date": "2026-08-25T07:05:00Z"
        }
      ],
      "created_by": "admin",
      "deleted_at": null,
      "create_date": "2026-08-25T07:06:00Z",
      "update_date": "2026-08-25T07:07:13Z"
    }
  ]
  ```

#### 9. `storio.getNoticeDetail(id, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/notices/${id}/`
- **Method Signature:** `storio.getNoticeDetail(id: number | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioNotice | null>`
- **Description:** Returns a single published notice object matching the schema above.

---

### Section 4: Blogs, Categories & News Articles

#### 10. `storio.getBlogs(paramsOrOptions?, tenantHostOrOptions?)` *(Updated with Query Filters)*
- **Endpoint:** `GET /api/v2/template/blogs/`
- **Method Signature:** `storio.getBlogs(paramsOrOptions?: ({ search?: string; category?: number | string } & StorioFetchOptions) | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioBlogPost[] | null>`
- **Description:** Returns published blog articles ordered by `-publish_date`.
- **Query Parameters Supported:**
  - `search` (`string`): Case-insensitive match against `title`, `content`, and `author`.
  - `category` (`number | string`): Numeric category ID to filter by (`categories__id`).
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 14,
      "title": "Modern Approaches in Digital Education",
      "slug": "modern-approaches-digital-education",
      "content": "<p>Full HTML article body...</p>",
      "excerpt": "Exploring smart classroom tools for better student engagement.",
      "author": "Editorial Team",
      "status": "published",
      "status_display": "Published",
      "tags": ["education", "technology"],
      "publish_date": "2026-02-15T09:00:00Z",
      "deleted_at": null,
      "created_by": 1,
      "featured_image": 42,
      "featured_image_data": {
        "id": 42,
        "file": "/media/uploads/classroom.webp",
        "file_type": "image",
        "file_name": "classroom.webp",
        "file_size": 154000,
        "file_size_display": "150.39 KB",
        "alt_text": "Smart classroom",
        "uploaded_by": "admin",
        "create_date": "2026-02-15T08:45:00Z",
        "update_date": "2026-02-15T08:45:00Z"
      },
      "seo_title": "Modern Digital Education",
      "seo_description": "Discover how digital tools support learning.",
      "view_count": 328,
      "is_featured": true,
      "categories": [3],
      "categories_data": [
        {
          "id": 3,
          "name": "Academic Insights",
          "slug": "academic-insights",
          "description": "Curriculum and educational insights",
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

#### 11. `storio.getBlogCategories(tenantHostOrOptions?)` *(Added)*
- **Endpoint:** `GET /api/v2/template/blogs/categories/`
- **Method Signature:** `storio.getBlogCategories(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioBlogCategory[] | null>`
- **Description:** Returns all blog categories with published post counts for filter tabs and sidebars. Pass the returned `id` to `storio.getBlogs({ category: id })`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 3,
      "name": "Academic Insights",
      "slug": "academic-insights",
      "description": "Curriculum and educational insights",
      "parent": null,
      "parent_name": null,
      "posts_count": 8,
      "create_date": "2026-01-10T12:00:00Z",
      "update_date": "2026-01-10T12:00:00Z"
    }
  ]
  ```

#### 12. `storio.getBlogDetail(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/blogs/${slug}/`
- **Method Signature:** `storio.getBlogDetail(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioBlogPost | null>`
- **Description:** Returns a single published blog post by `slug` (same object shape as `getBlogs` items).

---

### Section 5: Faculty, Staff & Board Directory

#### 13. `storio.getStaff(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/staff/`
- **Method Signature:** `storio.getStaff(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioStaffMember[] | null>`
- **Description:** Returns the teachers and administrative staff directory ordered by `order`.
- **Field Note:** Live responses use `role`, `department_name`, `department_id`, `phone`, and `profile_pic_data.file_url`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "name": "Prof. Jane Doe",
      "role": "Senior Physics Lecturer",
      "department": 3,
      "department_name": "Science",
      "department_id": 3,
      "email": "faculty@example.edu",
      "phone": "+880 1700-000001",
      "is_mpo": true,
      "joining_date": "2020-01-15",
      "bio": "M.Sc. in Applied Physics with 12 years of teaching experience.",
      "profile_pic": 14,
      "profile_pic_data": {
        "id": 14,
        "file_url": "/media/uploads/faculty_1.webp",
        "alt_text": "Prof. Jane Doe",
        "file_type": "image"
      },
      "status": "active",
      "order": 1,
      "create_date": "2026-08-09T06:07:50Z",
      "update_date": "2026-08-09T06:07:50Z"
    }
  ]
  ```

#### 14. `storio.getTeam(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/team/`
- **Method Signature:** `storio.getTeam(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioTeamMember[] | null>`
- **Description:** Returns visible governing body, board of trustees, and committee members.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "fullname": "Dr. Robert Smith",
      "designation": "Chairman, Governing Body",
      "role": "Chairman",
      "experience": "25 years in academic leadership.",
      "section": 1,
      "section_name": "Governing Body",
      "phone": "+880 1700-000002",
      "address": "Dhaka, Bangladesh",
      "tenure_start": "2024-01-01",
      "tenure_end": "2027-12-31",
      "image": 20,
      "image_data": {
        "id": 20,
        "file_url": "/media/uploads/chairman.webp",
        "alt_text": "Dr. Robert Smith",
        "caption": "Chairman"
      },
      "image_shape": "circle",
      "image_shape_display": "Circle",
      "is_visible": true,
      "order": 1,
      "create_date": "2026-07-10T08:00:00Z",
      "update_date": "2026-07-10T08:00:00Z"
    }
  ]
  ```

---

### Section 6: Media Gallery & Photo Albums

#### 15. `storio.getGallery(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/gallery/`
- **Method Signature:** `storio.getGallery(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioGalleryItem[] | null>`
- **Description:** Returns visible gallery photos along with `media_data` and album IDs.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "media": 36,
      "media_data": {
        "id": 36,
        "file": "/media/uploads/science_fair.webp",
        "file_type": "image",
        "file_name": "science_fair.webp",
        "file_size": 124000,
        "file_size_display": "121.09 KB",
        "title": null,
        "alt_text": "Science exhibition booth",
        "caption": "Annual Science Fair",
        "uploaded_by": "admin",
        "create_date": "2026-07-09T09:52:03Z",
        "update_date": "2026-07-09T09:52:03Z"
      },
      "image_title": "Annual Science Fair 2026",
      "caption": "Students presenting robotics models",
      "alt_text": "Science exhibition booth",
      "album": 3,
      "tags": "science, fair",
      "is_visible": true,
      "create_date": "2026-07-09T09:53:00Z",
      "update_date": "2026-07-09T09:53:00Z"
    }
  ]
  ```

#### 16. `storio.getAlbums(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/albums/`
- **Method Signature:** `storio.getAlbums(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAlbum[] | null>`
- **Description:** Returns gallery albums used to group photos from `getGallery()`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 3,
      "name": "Campus Exhibitions & Fairs",
      "slug": "campus-exhibitions-fairs",
      "description": "Snapshots from annual science fairs and cultural events.",
      "parent": null,
      "parent_name": null,
      "total_images": 12,
      "create_date": "2026-07-01T10:00:00Z",
      "update_date": "2026-07-01T10:00:00Z"
    }
  ]
  ```

---

### Section 7: School Activities, Events & Categories

#### 17. `storio.getActivities(paramsOrOptions?, tenantHostOrOptions?)` *(Updated with Query Filters)*
- **Endpoint:** `GET /api/v2/template/activities/`
- **Method Signature:** `storio.getActivities(paramsOrOptions?: ({ search?: string; category?: number | string } & StorioFetchOptions) | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioActivityItem[] | null>`
- **Description:** Returns published co-curricular activity posts with gallery images and categories.
- **Query Parameters Supported:**
  - `search` (`string`): Case-insensitive match against `title`, `content`, and `author`.
  - `category` (`number | string`): Numeric category ID (`categories__id`).
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 9,
      "title": "Robotics & STEM Innovation Workshop 2026",
      "slug": "robotics-stem-innovation-workshop-2026",
      "content": "<p>Over 120 students built autonomous rovers...</p>",
      "excerpt": "Hands-on robotics and microcontroller prototyping workshop.",
      "author": "Computer Science Dept",
      "status": "published",
      "status_display": "Published",
      "deleted_at": null,
      "created_by": 1,
      "gallery_images": [
        {
          "id": 18,
          "image_details": {
            "id": 105,
            "file": "/media/uploads/rover_demo.webp",
            "file_type": "image",
            "file_name": "rover_demo.webp",
            "alt_text": "Autonomous rover prototype"
          },
          "caption": "Testing rovers on competition track",
          "order": 1
        }
      ],
      "featured_image_data": {
        "id": 105,
        "file": "/media/uploads/rover_demo.webp",
        "file_type": "image",
        "file_name": "rover_demo.webp",
        "alt_text": "Autonomous rover prototype"
      },
      "seo_title": "Robotics & STEM Workshop 2026",
      "seo_description": "Highlights from our STEM workshop.",
      "view_count": 512,
      "is_featured": true,
      "categories": [4],
      "categories_data": [
        {
          "id": 4,
          "name": "STEM & Robotics",
          "slug": "stem-robotics",
          "description": "Engineering and technology clubs",
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
  ]
  ```

#### 18. `storio.getActivityCategories(tenantHostOrOptions?)` *(Added)*
- **Endpoint:** `GET /api/v2/template/activities/categories/`
- **Method Signature:** `storio.getActivityCategories(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioActivityCategory[] | null>`
- **Description:** Returns co-curricular activity categories and counts. Pass `id` to `storio.getActivities({ category: id })`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 4,
      "name": "STEM & Robotics",
      "slug": "stem-robotics",
      "description": "Engineering and technology clubs",
      "parent": null,
      "parent_name": null,
      "activities_count": 6,
      "create_date": "2026-01-15T09:00:00Z",
      "update_date": "2026-01-15T09:00:00Z"
    }
  ]
  ```

#### 19. `storio.getActivityDetail(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/activities/${slug}/`
- **Method Signature:** `storio.getActivityDetail(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioActivityItem | null>`
- **Description:** Returns a single published activity item by `slug` (same shape as `getActivities` items).

#### 20. `storio.getEvents(paramsOrOptions?, tenantHostOrOptions?)` *(Updated with Query Filters)*
- **Endpoint:** `GET /api/events/`
- **Method Signature:** `storio.getEvents(paramsOrOptions?: ({ status?: string; categories?: number | string; is_featured?: boolean; search?: string; ordering?: string } & StorioFetchOptions) | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioEvent[] | null>`
- **Description:** Institutional events list with dates, locations, featured image, and category breakdown.
- **Note:** Returns a DRF paginated object `{ count, next, previous, results: [...] }`. Use `unwrapList(res)` before mapping.
- **Query Parameters Supported:**
  - `status` (`string`): `published`, `draft`, or `archived` (unauthenticated requests default to `published`).
  - `categories` (`number | string`): Event category ID returned by `getEventCategories()`.
  - `is_featured` (`boolean`): Filter flagship events (`true` / `false`).
  - `search` (`string`): Case-insensitive match against `title`, `content`, and `location`.
  - `ordering` (`string`): `start_date`, `-start_date`, `created_at`, `-created_at`, `view_count`, or `-view_count`.
- **Verified JSON Response Shape:**
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 4,
        "title": "Annual Science Olympiad 2026",
        "slug": "annual-science-olympiad-2026",
        "content": "<p>2-day regional science exhibition and robotics tournament.</p>",
        "excerpt": "Regional science exhibition and robotics tournament.",
        "location": "Main Auditorium, Campus",
        "start_date": "2026-04-10T09:00:00Z",
        "end_date": "2026-04-11T17:00:00Z",
        "status": "published",
        "view_count": 450,
        "is_featured": true,
        "seo_title": "Annual Science Olympiad 2026",
        "seo_description": "Schedule and registration details.",
        "featured_image": 28,
        "featured_image_detail": {
          "id": 28,
          "file": "/media/uploads/science_olympiad.webp",
          "file_type": "image",
          "file_name": "science_olympiad.webp",
          "file_size": 182000,
          "file_size_display": "177.73 KB",
          "alt_text": "Science Olympiad Banner"
        },
        "categories": [1],
        "categories_detail": [
          {
            "id": 1,
            "name": "Science & Innovation",
            "slug": "science-innovation",
            "description": "Science fairs and robotics competitions",
            "events_count": 5,
            "created_at": "2026-01-10T12:00:00Z",
            "updated_at": "2026-01-10T12:00:00Z"
          }
        ],
        "created_at": "2026-02-18T10:05:00Z",
        "updated_at": "2026-02-19T14:20:00Z",
        "created_by": 1
      }
    ]
  }
  ```

#### 21. `storio.getEventCategories(tenantHostOrOptions?)` *(New)*
- **Endpoint:** `GET /api/event-categories/`
- **Method Signature:** `storio.getEventCategories(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioEventCategory[] | null>`
- **Description:** Returns all event categories and their published event counts. Pass `id` to `storio.getEvents({ categories: id })`.
- **Note:** Returns a DRF paginated object `{ count, next, previous, results: [...] }`. Use `unwrapList(res)` before mapping.
- **Verified JSON Response Shape:**
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "Science & Innovation",
        "slug": "science-innovation",
        "description": "Science fairs and robotics competitions",
        "events_count": 5,
        "created_at": "2026-01-10T12:00:00Z",
        "updated_at": "2026-01-10T12:00:00Z"
      }
    ]
  }
  ```

#### 22. `storio.getEventDetail(slugOrId, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/events/${slugOrId}/`
- **Method Signature:** `storio.getEventDetail(slugOrId: string | number, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioEvent | null>`
- **Description:** Fetches a single event by numeric `id` (recommended with the default DRF router) or `slug`, and increments `view_count`.

---

### Section 8: Dynamic CMS Custom Builder Pages

#### 23. `storio.getPages(tenantHostOrOptions?)` *(Added)*
- **Endpoint:** `GET /api/v2/template/pages/`
- **Method Signature:** `storio.getPages(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCustomPage[] | null>`
- **Description:** Lists all published pages built in **Dashboard → Page Management** (`content` may be HTML or structured `StorioCustomPageSection[]`, with embedded `Form` sections automatically enriched with `form_data`).
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 3,
      "title": "Admissions Info",
      "slug": "info",
      "featured_image": null,
      "is_published": true,
      "meta_title": "Admissions Information",
      "meta_description": "Everything you need to know about joining our campus.",
      "content": [
        {
          "id": "sec_1",
          "type": "Hero",
          "title": "Welcome Banner",
          "content": { "url": "/media/uploads/campus.webp", "overlayText": "Admissions 2026" }
        },
        {
          "id": "sec_2",
          "type": "Form",
          "title": "Inquiry Form",
          "layout": { "colSpan": 8, "minHeight": 260 },
          "content": {
            "formCode": "aa8a2a13-d6e4-41d5-9054-3f3803a5f68d",
            "form_data": {
              "code": "aa8a2a13-d6e4-41d5-9054-3f3803a5f68d",
              "title": "Inquiry Form",
              "status": "active",
              "elements": []
            }
          }
        }
      ],
      "created_at": "2026-09-01T10:00:00Z",
      "updated_at": "2026-09-10T11:30:00Z"
    }
  ]
  ```

#### 24. `storio.getPageBySlug(slug, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/pages/by-slug/${slug}/`
- **Method Signature:** `storio.getPageBySlug(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCustomPage | null>`
- **Description:** Fetches a single published custom page by slug (leading/trailing slashes are stripped automatically; supports nested slugs like `"about/history"`). Any `Form` sections (including inside `Split` or `SideList` slots) automatically include `form_data` (`StorioForm`). Returns `null` (404) if unpublished or missing.

---

### Section 9: Social Proof, Leadership & Promotions

#### 25. `storio.getTestimonials(tenantHostOrOptions?)` *(Strongly Typed)*
- **Endpoint:** `GET /api/v2/template/testimonials/`
- **Method Signature:** `storio.getTestimonials(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioTestimonial[] | null>`
- **Description:** Returns published parent, student, and alumni testimonials ordered by `order`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "name": "Sarah Ahmed",
      "designation": "Parent of Grade 8 Student",
      "organization": null,
      "message": "The teachers are attentive and the STEM clubs have helped my child thrive.",
      "rating": 5,
      "photo": 19,
      "photo_data": {
        "id": 19,
        "file_url": "/media/uploads/testimonial_1.webp",
        "alt_text": "Sarah Ahmed",
        "file_type": "image"
      },
      "status": "published",
      "order": 1,
      "create_date": "2026-07-10T10:00:00Z",
      "update_date": "2026-07-10T10:00:00Z"
    }
  ]
  ```

#### 26. `storio.getLeadershipMessages(tenantHostOrOptions?)` *(Strongly Typed)*
- **Endpoint:** `GET /api/v2/template/leadership-messages/`
- **Method Signature:** `storio.getLeadershipMessages(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioLeadershipMessage[] | null>`
- **Description:** Returns published speeches and welcome messages from the Principal, Chairman, or Founder.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "section_title": "Principal's Welcome",
      "name": "Dr. A. K. Rahman",
      "role": "Principal",
      "company": "Greenwood International Academy",
      "message": "<p>Welcome to our campus community where curiosity meets character.</p>",
      "image": 37,
      "image_data": {
        "id": 37,
        "file_url": "/media/uploads/principal.webp",
        "alt_text": "Principal portrait",
        "file_type": "image"
      },
      "signature": 38,
      "signature_data": {
        "id": 38,
        "file_url": "/media/uploads/principal_sig.png",
        "alt_text": "Signature",
        "file_type": "image"
      },
      "status": "published",
      "display_order": 1,
      "create_date": "2026-07-11T09:00:00Z",
      "update_date": "2026-07-11T09:00:00Z"
    }
  ]
  ```

#### 27. `storio.getPromotions(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/promotions/`
- **Method Signature:** `storio.getPromotions(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioPromotion[] | null>`
- **Description:** Returns currently live promotional banners, popups, and announcements (published and within `start_date`–`end_date` window).
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Spring Admission 2026 Open!",
      "subtitle": "Enroll today for the upcoming academic year",
      "description": "Admissions are now open from Nursery through Grade 12.",
      "badge_text": "ADMISSIONS OPEN",
      "image": 45,
      "image_detail": {
        "id": 45,
        "file_url": "/media/uploads/promo_banner.webp",
        "alt_text": "Admissions Banner",
        "file_type": "image"
      },
      "promotion_type": "banner",
      "target_audience": "all",
      "cta_label": "Apply Now",
      "cta_url": "/admission",
      "cta_is_external": false,
      "status": "published",
      "start_date": "2026-01-01",
      "end_date": "2026-12-31",
      "priority": 10,
      "view_count": 120,
      "click_count": 18,
      "is_live": true,
      "deleted_at": null,
      "created_by": "admin",
      "create_date": "2026-01-01T08:00:00Z",
      "update_date": "2026-01-01T08:00:00Z"
    }
  ]
  ```

#### 28. `storio.getPromotionDetail(id, tenantHostOrOptions?)` *(Added)*
- **Endpoint:** `GET /api/v2/template/promotions/${id}/`
- **Method Signature:** `storio.getPromotionDetail(id: number, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioPromotion | null>`
- **Description:** Fetches a single live promotion by ID and increments its `view_count`.

#### 29. `storio.trackPromotionClick(id, tenantHostOrOptions?)` *(New)*
- **Endpoint:** `POST /api/promotions/${id}/click/`
- **Method Signature:** `storio.trackPromotionClick(id: number | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioPromotionClickResponse | null>`
- **Description:** Increments `click_count` on a published promotion when a visitor clicks its CTA button (sends `POST` with `cache: 'no-store'`).
- **Verified JSON Response (`200 OK`):**
  ```json
  {
    "success": true
  }
  ```

---

### Section 10: Quick Links, FAQs, Videos, Calendar & Exam Results

#### 30. `storio.getImportantLinks(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/important-links/`
- **Method Signature:** `storio.getImportantLinks(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioImportantLink[] | null>`
- **Description:** Returns ordered institutional and external portal quick links.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Ministry of Education Portal",
      "url": "https://moedu.gov.bd",
      "order": 1
    }
  ]
  ```

#### 31. `storio.getFaqs(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/faqs/`
- **Method Signature:** `storio.getFaqs(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioFaq[] | null>`
- **Description:** Returns visible Frequently Asked Questions ordered by latest update.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "question": "How do I apply for admission?",
      "answer": "<p>Visit the Online Admission page and complete the application form.</p>",
      "is_visible": true
    }
  ]
  ```

#### 32. `storio.getVideos(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/reels/`
- **Method Signature:** `storio.getVideos(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioVideoItem[] | null>`
- **Description:** Returns active campus video reels and embeds.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Campus Virtual Tour 2026",
      "description": "Guided tour of our science labs and library.",
      "reel_type": "video",
      "platform": "youtube",
      "url": "https://www.youtube.com/watch?v=example123",
      "thumbnail_url": "/media/uploads/tour_thumb.webp",
      "views_count": 240,
      "likes_count": 32,
      "is_featured": true
    }
  ]
  ```

#### 33. `storio.getCalendarEvents(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/calendar/`
- **Method Signature:** `storio.getCalendarEvents(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCalendarEvent[] | null>`
- **Description:** Returns academic calendar dates, holidays, and festival schedules ordered by `start_date`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 3,
      "title": "Annual Sports Day",
      "description": "Inter-house athletics events.",
      "start_date": "2026-07-12T00:00:00Z",
      "end_date": "2026-07-16T00:00:00Z",
      "category": "festival",
      "level": "college",
      "is_all_day": true
    }
  ]
  ```

#### 34. `storio.getCalendarSettings(tenantHostOrOptions?)` *(New)*
- **Endpoint:** `GET /api/calendar/settings/`
- **Method Signature:** `storio.getCalendarSettings(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCalendarSetting | null>`
- **Description:** Returns the configured weekly weekend day numbers as a comma-separated string (`0` = Sunday … `5` = Friday, `6` = Saturday) so calendar grids highlight weekends accurately.
- **Verified JSON Response Shape:**
  ```json
  {
    "weekend_days": "5,6"
  }
  ```

#### 35. `storio.getExamResults(paramsOrOptions?, tenantHostOrOptions?)` *(Updated with Query Filter)*
- **Endpoint:** `GET /api/v2/template/exam-results/`
- **Method Signature:** `storio.getExamResults(paramsOrOptions?: ({ exam_type?: string } & StorioFetchOptions) | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioExamResult[] | null>`
- **Description:** Returns published board and internal exam result summaries (with automatic fallback to legacy endpoint if V2 returns empty).
- **Query Parameters Supported:**
  - `exam_type` (`string`): `'school'`, `'public'`, or `'admission'`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "exam_name": "SSC Public Examination",
      "class_name": "Class 10",
      "year": "2025",
      "total_examinees": 240,
      "passed": 238,
      "failed": 2,
      "aplus_count": 115,
      "agrade_count": 82,
      "pass_rate": "99.2%",
      "exam_type": "public",
      "file_url": "/media/exam_results/ssc_2025.pdf"
    }
  ]
  ```

---

### Section 11: Careers & Recruitment

#### 36. `storio.getCareers(paramsOrOptions?, tenantHostOrOptions?)` *(Strongly Typed + Filter)*
- **Endpoint:** `GET /api/v2/template/careers/jobs/`
- **Method Signature:** `storio.getCareers(paramsOrOptions?: ({ location?: string } & StorioFetchOptions) | string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCareer[] | null>`
- **Description:** Returns active job circulars ordered by newest first.
- **Query Parameters Supported:**
  - `location` (`string`): Case-insensitive substring filter (`location__icontains`), e.g. `"Dhaka"`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 1,
      "title": "Senior Mathematics Lecturer",
      "slug": "senior-mathematics-lecturer",
      "company_name": "Greenwood International Academy",
      "location": "Dhaka",
      "job_type": "Full-Time",
      "vacancy": 2,
      "deadline": "2026-10-01",
      "description": "<p>Minimum 5 years teaching experience required.</p>",
      "application_link": "https://apply.example.edu/math-lecturer",
      "status": "active",
      "attachments_data": [
        {
          "id": 53,
          "type": "document",
          "file_name": "job_circular.pdf",
          "url": "/media/uploads/job_circular.pdf"
        }
      ],
      "created_at": "2026-08-01T09:00:00Z",
      "updated_at": "2026-08-01T09:00:00Z"
    }
  ]
  ```

#### 37. `storio.getJobDetail(slug, tenantHostOrOptions?)` *(Strongly Typed)*
- **Endpoint:** `GET /api/v2/template/careers/jobs/${slug}/`
- **Method Signature:** `storio.getJobDetail(slug: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioCareer | null>`
- **Description:** Fetches full circular details for an active job posting by `slug` (same object shape as `getCareers` items).

---

### Section 12: National Education Board Notice Sync

#### 38. `storio.getBoardNotices(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/board-notices/`
- **Method Signature:** `storio.getBoardNotices(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioBoardNotice[] | null>`
- **Description:** Returns notices fetched from the institution's configured national/regional Education Boards when enabled in Dashboard → Board Settings.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "title": "SSC Examination Center Notice",
      "url": "https://dhakaeducationboard.gov.bd/notices/example.pdf",
      "publish_date": "2026-02-24",
      "board_name": "Dhaka Board"
    }
  ]
  ```

---

### Section 13: Online Admission Portal & Contact Form

#### 39. `storio.getAdmissionFormConfig(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/admission/form-config/current/`
- **Method Signature:** `storio.getAdmissionFormConfig(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionFormConfig | null>`
- **Description:** Returns the current dynamic admission form fields, active flag, and deadline.
- **Verified JSON Response Shape:**
  ```json
  {
    "id": 1,
    "title": "Admission Form 2026",
    "description": "Complete all required fields accurately.",
    "is_active": true,
    "deadline": "2026-05-31",
    "fields": [
      { "id": "student_name", "label": "Student Name", "type": "text", "required": true, "order": 1 },
      { "id": "email", "label": "Email Address", "type": "email", "required": true, "order": 2 },
      { "id": "applying_grade", "label": "Applying For", "type": "select", "required": true, "options": ["Class 6", "Class 9"], "order": 3 }
    ],
    "created_at": "2026-01-01T08:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
  ```

#### 40. `storio.sendAdmissionOTP(email, phone?, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/admission/send-otp/`
- **Method Signature:** `storio.sendAdmissionOTP(email: string, phoneOrTenantHost?: string | StorioFetchOptions, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionOTPResponse | null>`
- **Description:** Sends a 6-digit OTP to the applicant's `email` (and optional `phone` if SMS OTP is enabled on the tenant).
- **Verified JSON Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Verification code sent to your email."
  }
  ```

#### 41. `storio.verifyAdmissionOTP(email, otpCode, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/admission/verify-otp/`
- **Method Signature:** `storio.verifyAdmissionOTP(email: string, otpCode: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionOTPResponse | null>`
- **Description:** Verifies the applicant's 6-digit OTP before submitting the admission application.
- **Verified JSON Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Email verified successfully"
  }
  ```

#### 42. `storio.submitAdmissionApplication(formData, otpCode, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/admission/applications/`
- **Method Signature:** `storio.submitAdmissionApplication(formData: Record<string, unknown>, otpCode: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAdmissionApplicationResponse | null>`
- **Description:** Submits the verified admission application (`{ form_data, otp_code }`) matching fields from `getAdmissionFormConfig()`.
- **Verified JSON Response (`201 Created`):**
  ```json
  {
    "id": 12,
    "application_number": "APP-2026-00012",
    "form_data": {
      "student_name": "Zara Rahman",
      "email": "applicant@example.com",
      "applying_grade": "Class 9"
    },
    "submitted_at": "2026-03-10T11:15:00Z"
  }
  ```

#### 43. `storio.submitContactMessage(formData, tenantHostOrOptions?)`
- **Endpoint:** `POST /api/v2/template/contact/`
- **Method Signature:** `storio.submitContactMessage(formData: Record<string, unknown>, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioContactFormResponse | null>`
- **Description:** Submits public contact inquiries (rate-limited for anonymous users at 5/hour).
- **Payload Sent:** `{ name, email, mobile, subject, message, recaptcha_token? }` (`recaptcha_token` is optional; set to `null` or omit if not using hCaptcha).
- **Verified JSON Responses:**
  - `201 Created`: `{ "success": true, "message": "Thank you for contacting us! We will get back to you soon." }`
  - `400 Bad Request`: `{ "email": ["Enter a valid email address."] }`

---

### Section 14: Dynamic Form Builder

#### 44. `storio.getForms(tenantHostOrOptions?)` *(Added)*
- **Endpoint:** `GET /api/v2/template/forms/`
- **Method Signature:** `storio.getForms(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioForm[] | null>`
- **Description:** Returns all active dynamic forms created in **Dashboard → Form Builder**.

#### 45. `storio.getForm(code, tenantHostOrOptions?)` *(Added)*
- **Endpoint:** `GET /api/v2/template/forms/${code}/`
- **Method Signature:** `storio.getForm(code: string, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioForm | null>`
- **Description:** Fetches a single active form definition by its UUID `code` (defaults to `next: { revalidate: 0 }`). Returns `403` if inactive or `404` if not found.
- **Verified JSON Response Shape:**
  ```json
  {
    "code": "aa8a2a13-d6e4-41d5-9054-3f3803a5f68d",
    "title": "Scholarship Application",
    "description": "Please upload supporting documents.",
    "header_image": null,
    "header_image_data": null,
    "status": "active",
    "elements": [
      {
        "id": "field-1",
        "name": "full_name",
        "type": "text",
        "label": "Full Name",
        "placeholder": "Enter your name",
        "required": true,
        "validation": { "minLength": 2, "maxLength": 100 }
      },
      {
        "id": "field-2",
        "name": "transcript",
        "type": "file",
        "label": "Academic Transcript",
        "required": true,
        "acceptedTypes": ["application/pdf"],
        "maxSize": 5242880
      }
    ],
    "settings": {
      "submitButtonText": "Submit Application",
      "successMessage": "Your application has been recorded."
    },
    "theme": {},
    "created_at": "2026-09-01T10:00:00Z",
    "updated_at": "2026-09-05T12:00:00Z"
  }
  ```

#### 46. `storio.uploadFormFile(code, file, fieldIdOrOptions?, tenantHostOrOptions?)` *(Added)*
- **Endpoint:** `POST /api/v2/template/forms/${code}/upload/`
- **Method Signature:** `storio.uploadFormFile(formCode: string, file: File | Blob, fieldIdOrOptions?: string | StorioFetchOptions, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioFormUploadResponse | null>`
- **Description:** Uploads a file/image attachment for a `file` or `image` field on an active form, enforcing that field's `maxSize` and `acceptedTypes`. Pass the returned `url` or `id` into `submitFormResponse()` `answers`.
- **Verified JSON Response (`201 Created`):**
  ```json
  {
    "id": 91,
    "url": "https://tenant.storio.cloud/media/uploads/transcript.pdf",
    "file_url": "/media/uploads/transcript.pdf",
    "file_type": "document",
    "file_name": "transcript.pdf"
  }
  ```

#### 47. `storio.submitFormResponse(payload, tenantHostOrOptions?)` *(Added)*
- **Endpoint:** `POST /api/v2/template/forms/submit/`
- **Method Signature:** `storio.submitFormResponse(payload: StorioFormSubmitPayload, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioFormSubmitResponse | null>`
- **Description:** Submits user answers (`{ form: "<code>", answers: { "<fieldId>": value } }`) for an active form (`cache: 'no-store'`).
- **Verified JSON Response (`201 Created`):**
  ```json
  {
    "message": "Submitted successfully"
  }
  ```

---

### Section 15: Academics

#### 48. `storio.getClassRoutines(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/academic/class-routines/`
- **Method Signature:** `storio.getClassRoutines(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioClassRoutine[] | null>`
- **Description:** Returns active weekly class routines with downloadable PDF (`routine_file_url`) and day-by-day `schedule` periods.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 8,
      "class_name": "Class 10",
      "section": "A",
      "shift": "Morning",
      "academic_year": 2026,
      "effective_from": "2026-01-15",
      "routine_file": 53,
      "routine_file_url": "/media/uploads/class_10_routine.pdf",
      "is_active": true,
      "schedule": [
        {
          "day": "Sunday",
          "periods": [
            { "period": 1, "subject": "Mathematics", "teacher": "Dr. Doe", "room": "302", "start_time": "08:00", "end_time": "08:45" }
          ]
        }
      ],
      "created_at": "2026-01-10T09:00:00Z",
      "updated_at": "2026-01-10T09:00:00Z"
    }
  ]
  ```

#### 49. `storio.getSyllabuses(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/academic/syllabuses/`
- **Method Signature:** `storio.getSyllabuses(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioSyllabus[] | null>`
- **Description:** Returns active curriculum syllabus documents and downloadable PDFs.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 3,
      "title": "Final Term Syllabus",
      "class_name": "Class 9",
      "exam_type": "Final",
      "academic_year": 2026,
      "file": 60,
      "file_url": "/media/uploads/class_9_syllabus.pdf",
      "file_size": "1.2 MB",
      "description": "Complete curriculum topics for Class 9.",
      "uploaded_at": "2026-01-20T10:00:00Z",
      "is_active": true
    }
  ]
  ```

#### 50. `storio.getStudentStats(params?, tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/student-stats/`
- **Method Signature:** `storio.getStudentStats(params?: { year?: number | string; program?: string }, tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioStudentStatsResponse | null>`
- **Description:** Returns student enrollment statistics grouped by year, academic program, class, and stream.
- **Query Parameters Supported:** `year`, `program`.
- **Verified JSON Response Shape:**
  ```json
  {
    "academic_year": 2026,
    "grand_total_male": 315,
    "grand_total_female": 326,
    "grand_total": 641,
    "total_sections": 21,
    "classes": [
      {
        "id": 23,
        "academic_year": 2026,
        "year": 2026,
        "program": "General",
        "class_name": "Class 10",
        "class_name_en": "Class Ten",
        "groups": [
          { "group_name": "Science", "sections": ["A", "B"], "total_male": 60, "total_female": 65, "total_students": 125 }
        ],
        "total_male": 60,
        "total_female": 65,
        "total_students": 125,
        "shift": "Morning",
        "order": 1,
        "created_at": "2026-02-01T08:00:00Z",
        "updated_at": "2026-02-01T08:00:00Z"
      }
    ]
  }
  ```

#### 51. `storio.getAcademicPrograms(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/academic/programs/`
- **Method Signature:** `storio.getAcademicPrograms(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioAcademicProgram[]>`
- **Description:** Returns configured academic programs (always resolves to an array `[]`, never `null`).
- **Verified JSON Response Shape (Array):**
  ```json
  [
    { "id": 8, "name": "Vocational", "classes": ["Class 9", "Class 10"], "is_custom": true },
    { "id": null, "name": "Pre-Primary", "classes": ["Play", "Nursery", "KG"], "is_custom": false }
  ]
  ```

---

### Section 16: Citizen Charter & Institutional Compliance

#### 52. `storio.getMpoInfo(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/mpo-info/`
- **Method Signature:** `storio.getMpoInfo(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioMpoInfo | null>`
- **Description:** Returns government Monthly Pay Order (MPO) status, teacher counts, and gazette documents.
- **Verified JSON Response Shape:**
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
      { "name": "MPO Gazette", "file_id": 53, "file_url": "/media/uploads/mpo_gazette.pdf" }
    ],
    "created_at": "2026-09-27T05:34:01Z",
    "updated_at": "2026-09-28T10:24:36Z"
  }
  ```

#### 53. `storio.getInformationService(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/information-service/`
- **Method Signature:** `storio.getInformationService(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioInformationService | null>`
- **Description:** Returns the designated Right to Information (RTI) / Information Service Center desk details.
- **Verified JSON Response Shape:**
  ```json
  {
    "id": 1,
    "title": "Information Service Center Desk",
    "address": "Admin Building Room 101, Dhaka",
    "responsible_person": "Designated Information Officer",
    "designation": "Assistant Headmaster",
    "mobile": "+880 1700-000001",
    "phone": "+880 2-9990001",
    "email": "info-desk@example.edu",
    "photo": 1,
    "photo_url": "/media/uploads/rti_officer.webp",
    "office_hours": "09:00 AM - 04:00 PM (Sun - Thu)",
    "description": "RTI Information Desk",
    "services_offered": [
      "Admissions Info",
      "Transcript Inquiries",
      "Citizen Right to Information (RTI)"
    ],
    "created_at": "2026-09-27T05:34:01Z",
    "updated_at": "2026-09-28T10:17:32Z"
  }
  ```

#### 54. `storio.getComplaintOfficer(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/complaint-officer/`
- **Method Signature:** `storio.getComplaintOfficer(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioComplaintOfficer | null>`
- **Description:** Returns Grievance Redress System (GRS) focal officer details and `complaint_process` (may be a plain string or structured step array depending on tenant configuration).
- **Verified JSON Response Shape:**
  ```json
  {
    "id": 1,
    "name": "Grievance Focal Point",
    "designation": "Senior Faculty & GRS Officer",
    "address": "Room 205, Main Academic Building",
    "mobile": "+880 1700-000002",
    "phone": "+880 2-9990002",
    "email": "grs@example.edu",
    "photo": 48,
    "photo_url": "/media/uploads/grs_officer.webp",
    "description": "Handles student and guardian grievances.",
    "complaint_process": "1. Submit written application\n2. Review within 7 working days",
    "office_hours": "08:00 AM - 05:00 PM (Sunday to Thursday)",
    "created_at": "2026-09-27T05:34:01Z",
    "updated_at": "2026-09-28T10:12:44Z"
  }
  ```

#### 55. `storio.getHotlines(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/hotlines/`
- **Method Signature:** `storio.getHotlines(tenantHostOrOptions?: string | StorioFetchOptions): Promise<StorioHotline[] | null>`
- **Description:** Returns active government and emergency helpline contacts sorted by `order`.
- **Verified JSON Response Shape (Array):**
  ```json
  [
    {
      "id": 11,
      "title": "Emergency Campus Service",
      "number": "999",
      "description": "24/7 emergency response",
      "category": "emergency",
      "is_emergency": true,
      "order": 0,
      "is_active": true,
      "created_at": "2026-09-28T10:26:21Z",
      "updated_at": "2026-09-28T10:26:21Z"
    }
  ]
  ```

---

### Section 17: Dynamic Custom Collections & Core Fetcher

#### 56. `storio.getCollection<T>(slug, options?)` *(Added)*
- **Endpoint:** `GET /api/v2/collections/${slug}/`
- **Method Signature:** `storio.getCollection<T = Record<string, unknown>>(slug: string, options?: StorioFetchOptions & { page?: number; pageSize?: number; sortBy?: string; expand?: string }): Promise<StorioCollectionResponse<T> | null>`
- **Description:** Queries published items from a tenant's Custom Collection (Dashboard → Custom Collections), with pagination, sorting (`order`, `created_at`, `updated_at`, `id`), and optional batched relation expansion (`expand`).
- **Verified JSON Response Shape:**
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "schema_version": 1,
    "results": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "data": { "title": "Computer Lab", "capacity": 40 },
        "order": 0,
        "is_published": true,
        "created_at": "2026-10-01T10:00:00Z",
        "updated_at": "2026-10-01T10:00:00Z"
      }
    ]
  }
  ```

#### 57. `storio.getCollectionItem<T>(slug, itemId, options?)` *(Added)*
- **Endpoint:** `GET /api/v2/collections/${slug}/${itemId}/`
- **Method Signature:** `storio.getCollectionItem<T = Record<string, unknown>>(slug: string, itemId: string, options?: StorioFetchOptions & { expand?: string }): Promise<StorioCollectionItem<T> | null>`
- **Description:** Fetches a single published item by UUID from a Custom Collection (with optional `expand`).

#### 58. `storio.apiFetch<T>(endpoint, options?)`
- **Method Signature:** `apiFetch<T>(endpoint: string, options?: StorioFetchOptions): Promise<T | null>`
- **Description:** Low-level generic fetch wrapper used internally by all SDK methods. Automatically injects `x-tenant-host` (and server-side `Host`), handles `FormData` vs JSON headers, and supports `throwOnError: true` (throwing `StorioAPIError`).

---

## 4. Complete TypeScript Type Definitions

Below are the exact interfaces, union types, and error class exported by `@storio/template-sdk`:

```typescript
export interface StorioFetchOptions extends RequestInit {
  tenantHost?: string;
  backendBaseUrl?: string;
  next?: { revalidate?: number | false; tags?: string[] };
  throwOnError?: boolean;
}

export declare class StorioAPIError extends Error {
  public readonly status: number;
  public readonly data: unknown;
  constructor(message: string, status: number, data?: unknown);
}

export interface StorioCollectionItem<T = Record<string, unknown>> {
  id: string;
  data: T;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StorioCollectionResponse<T = Record<string, unknown>> {
  count: number;
  next: string | null;
  previous: string | null;
  results: StorioCollectionItem<T>[];
  schema_version: number;
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
  name?: string;
  href?: string;
  isVisible?: boolean;
  subLinks?: StorioNavigationItem[];
  label?: string;
  url?: string;
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

export interface StorioInstitutionCard {
  id: number;
  institution_profile?: number | null;
  title: string;
  description?: string | null;
  icon?: string | null;
  image?: number | null;
  image_url?: string | null;
  order?: number;
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

export interface StorioBlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number | null;
  parent_name?: string | null;
  posts_count?: number;
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

export interface StorioActivityCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number | null;
  parent_name?: string | null;
  activities_count?: number;
}

export interface StorioEventCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  events_count?: number;
  created_at?: string;
  updated_at?: string;
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

export interface StorioPageSectionLayout {
  colSpan?: number;
  minHeight?: number;
}

export interface StorioPageSectionBase {
  id: string;
  title?: string;
  titleColor?: string;
  titleFont?: string;
  titleWeight?: string;
  cardColor?: string;
  tableHeaderBg?: string;
  tableHeaderColor?: string;
  tableHeaderFont?: string;
  tableHeaderWeight?: string;
  tableBodyColor?: string;
  tableBodyFont?: string;
  animationType?: 'none' | 'float' | 'zoom' | 'slide' | string;
  layout?: StorioPageSectionLayout;
}

export interface StorioPageFeatureItem {
  title: string;
  description: string;
  icon?: string;
  titleFont?: string;
  titleWeight?: string;
  titleColor?: string;
  descFont?: string;
  descColor?: string;
}

export interface StorioPageListItem {
  id?: string;
  title: string;
  link: string;
}

export interface StorioPageImageItem {
  url: string;
  caption?: string;
  altText?: string;
}

export interface StorioPageTableContent {
  headers: string[];
  rows: string[][];
}

export interface StorioPageImageContent {
  images?: StorioPageImageItem[];
  url?: string;
  caption?: string;
  altText?: string;
}

export interface StorioPageHeroContent {
  url: string;
  overlayText?: string;
}

export interface StorioPageSideListContent {
  description: string;
  list: StorioPageListItem[];
  listPosition: 'left' | 'right';
  sidebarWidth?: 'narrow' | 'standard' | 'wide';
}

export interface StorioPageFormContent {
  formCode: string;
  form_data?: StorioForm | null;
}

export type StorioPageSplitContent =
  | string
  | StorioPageTableContent
  | StorioPageFeatureItem[]
  | StorioPageListItem[]
  | StorioPageImageContent
  | StorioPageFormContent;

export interface StorioPageSplitSlot {
  type: 'RichText' | 'FeatureGrid' | 'CustomList' | 'CustomTable' | 'Image' | 'Form';
  content: StorioPageSplitContent;
}

export interface StorioPageSplitContentWrapper {
  left: StorioPageSplitSlot;
  right: StorioPageSplitSlot;
  sidebarWidth?: 'narrow' | 'standard' | 'wide';
  listPosition?: 'left' | 'right';
}

export type StorioCustomPageSection =
  | (StorioPageSectionBase & { type: 'Hero'; content: StorioPageHeroContent })
  | (StorioPageSectionBase & { type: 'RichText'; content: string })
  | (StorioPageSectionBase & { type: 'Image'; content: StorioPageImageContent })
  | (StorioPageSectionBase & { type: 'FeatureGrid'; content: StorioPageFeatureItem[] })
  | (StorioPageSectionBase & { type: 'CustomList'; content: StorioPageListItem[] })
  | (StorioPageSectionBase & { type: 'CustomTable'; content: StorioPageTableContent })
  | (StorioPageSectionBase & { type: 'SideList'; content: StorioPageSideListContent })
  | (StorioPageSectionBase & { type: 'Split'; content: StorioPageSplitContentWrapper })
  | (StorioPageSectionBase & { type: 'Form'; content: StorioPageFormContent });

export interface StorioCustomPage {
  id: number;
  title: string;
  slug: string;
  content: string | StorioCustomPageSection[];
  is_published?: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  featured_image?: string | null;
  created_at?: string;
  updated_at?: string;
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

export interface StorioPromotionMedia {
  id: number;
  file_url: string;
  alt_text?: string;
  file_type?: string;
}

export interface StorioPromotion {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  badge_text?: string;
  image?: number | string | null;
  image_detail?: StorioPromotionMedia | null;
  promotion_type?: string;
  target_audience?: string;
  cta_label?: string;
  cta_url?: string;
  cta_is_external?: boolean;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  priority?: number;
  is_live?: boolean;
}

export interface StorioPromotionClickResponse {
  success: boolean;
}

export interface StorioCareerAttachment {
  id: number;
  type: string;
  file_name: string;
  url: string;
}

export interface StorioCareer {
  id: number;
  title: string;
  slug: string;
  company_name: string;
  location: string;
  job_type: string;
  vacancy: number;
  deadline: string;
  description: string;
  application_link?: string | null;
  status: string;
  attachments_data?: StorioCareerAttachment[];
  created_at?: string;
  updated_at?: string;
}

export interface StorioLeadershipMedia {
  id: number;
  file_url: string;
  alt_text?: string;
  file_type?: string;
}

export interface StorioLeadershipMessage {
  id: number;
  section_title?: string;
  name: string;
  role: string;
  company?: string;
  message: string;
  image_data?: StorioLeadershipMedia | null;
  signature_data?: StorioLeadershipMedia | null;
  status: string;
  display_order?: number;
}

export interface StorioTestimonial {
  id: number;
  name: string;
  designation?: string;
  organization?: string;
  message: string;
  rating?: number;
  photo_data?: {
    id: number;
    file_url: string;
    alt_text?: string;
    file_type?: string;
  } | null;
  status: string;
  order?: number;
}

export interface StorioFormHeaderImage {
  id: number;
  file_url: string;
  alt_text?: string;
}

export interface StorioFormOption {
  label: string;
  value: string;
}

export interface StorioFormValidation {
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  minDate?: string | null;
  maxDate?: string | null;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}

export interface StorioFormConditionalLogic {
  enabled?: boolean;
  fieldId?: string;
  operator?: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan' | string;
  value?: string | number | boolean;
}

export type StorioFormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'image'
  | 'header_image'
  | 'hidden'
  | string;

export interface StorioFormElement {
  id: string;
  type: StorioFormFieldType;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  defaultValue?: string | number | boolean | string[];
  value?: string;
  options?: StorioFormOption[];
  layout?: 'vertical' | 'horizontal' | string;
  rows?: number;
  allowMultiple?: boolean;
  acceptedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  showPreview?: boolean;
  imageUrl?: string;
  altText?: string;
  borderRadius?: string;
  maxHeight?: string;
  validation?: StorioFormValidation;
  conditionalLogic?: StorioFormConditionalLogic;
}

export interface StorioFormSettings {
  showProgressBar?: boolean;
  allowMultipleSubmissions?: boolean;
  allow_multiple_submissions?: boolean;
  successMessage?: string;
  confirmation_message?: string;
  redirectUrl?: string;
  submitButtonText?: string;
  emailNotifications?: boolean;
  notificationEmail?: string;
  theme?: Record<string, unknown>;
}

export interface StorioForm {
  code: string;
  title: string;
  description?: string;
  header_image?: number | null;
  header_image_data?: StorioFormHeaderImage | null;
  status: string;
  elements: StorioFormElement[];
  settings?: StorioFormSettings;
  theme?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface StorioFormUploadResponse {
  id: number;
  url: string;
  file_url: string;
  file_type: string;
  file_name: string;
}

export interface StorioFormSubmitPayload {
  form: string;
  answers: Record<string, string | number | boolean | string[] | null>;
}

export interface StorioFormSubmitResponse {
  message: string;
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

export interface StorioCalendarSetting {
  weekend_days: string;
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

export interface StorioAcademicProgram {
  id: number | null;
  name: string;
  classes: string[];
  is_custom: boolean;
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
  services_offered?: string[] | string;
  created_at?: string;
  updated_at?: string;
}

export interface StorioComplaintStep {
  step_number?: number;
  title?: string;
  description?: string;
}

export interface StorioComplaintOfficer {
  id: number;
  name?: string;
  designation?: string;
  address?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  photo?: number;
  photo_url?: string;
  description?: string;
  complaint_process?: StorioComplaintStep[] | string;
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

## 5. Architectural Best Practices, Caching & Error Handling

1. **Parallel Server Fetching:** Fetch independent layout, navigation, and page sections together with `Promise.all` to minimize Time to First Byte (TTFB).
2. **Next.js Revalidation Strategy:**
   - **Theme customization, menu & layout:** Use `next: { revalidate: 0 }` so dashboard publishes take effect immediately.
   - **High-velocity content (notices, blogs, events):** Default `revalidate: 60` or `revalidate: 0` when instant search/filtering is needed.
   - **Slow-changing profile data:** Use `next: { revalidate: 3600 }` or `86400`.
3. **Structured Error Handling (`throwOnError` & `StorioAPIError`):**
   By default, the SDK logs a warning and returns `null` on failure. When submitting forms or debugging, pass `throwOnError: true` and catch `StorioAPIError`:
   ```typescript
   import { storio, StorioAPIError } from '@storio/template-sdk';

   try {
     await storio.submitFormResponse({ form: code, answers }, { tenantHost, throwOnError: true });
   } catch (err) {
     if (err instanceof StorioAPIError) {
       console.error(`HTTP ${err.status}:`, err.message, err.data);
     }
   }
   ```

---

## 6. Next.js App Router Implementation Guide & Examples

### Example 1: Complete Server Homepage (`src/app/page.tsx`)

```tsx
import { headers } from 'next/headers';
import { storio, StorioLayoutResponse, StorioNotice, StorioEvent } from '@storio/template-sdk';
import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';

function unwrapList<T>(res: T[] | { results?: T[] } | null | undefined): T[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}

export default async function HomePage() {
  const headersList = await headers();
  const rawHost = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host = rawHost.split(':')[0];

  const linkedTenant = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isStandalone = isLocalHost && !linkedTenant;
  const tenantHost = linkedTenant || (isStandalone ? 'demo.storio.cloud' : host);

  const [rawLayout, rawNotices, rawEvents] = await Promise.all([
    storio.getLayout({ tenantHost, next: { revalidate: 0 } }),
    storio.getNotices(tenantHost),
    storio.getEvents({ is_featured: true }, tenantHost),
  ]);

  const layout: StorioLayoutResponse | null = rawLayout || (isStandalone ? DEFAULT_DEMO_DATA.layout : null);
  const notices: StorioNotice[] = rawNotices?.length ? rawNotices : (isStandalone ? DEFAULT_DEMO_DATA.notices : []);
  const events: StorioEvent[] = unwrapList(rawEvents);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="p-4 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {layout?.settings?.logo_url && (
            <img src={layout.settings.logo_url} alt="Logo" className="h-10 w-auto" />
          )}
          <h1 className="text-xl font-bold">{layout?.settings?.site_title || 'Campus Portal'}</h1>
        </div>
        <nav className="flex space-x-4">
          {layout?.navigation?.items
            ?.filter((item) => item.isVisible !== false)
            .map((item) => (
              <a
                key={item.id || item.href || item.url}
                href={item.href || item.url || '/'}
                className="text-gray-700 hover:text-emerald-600 font-medium"
              >
                {item.name || item.label}
              </a>
            ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold border-b pb-3 mb-4">Notice Board</h2>
          {notices.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {notices.map((notice) => (
                <li key={notice.id} className="py-3 font-medium">{notice.title}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No announcements posted at this time.</p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold border-b pb-3 mb-4">Featured Events</h2>
          {events.length > 0 ? (
            <ul className="space-y-2">
              {events.map((evt) => (
                <li key={evt.id} className="font-medium">{evt.title} — {evt.location}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No featured events.</p>
          )}
        </section>
      </main>
    </div>
  );
}
```

### Example 2: Dynamic Form Upload & Submission (`src/components/DynamicForm.tsx`)

```tsx
'use client';

import React, { useState } from 'react';
import { storio, StorioForm, StorioAPIError } from '@storio/template-sdk';

export default function DynamicForm({ form, tenantHost }: { form: StorioForm; tenantHost: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = async (fieldId: string, file?: File) => {
    if (!file) return;
    const uploaded = await storio.uploadFormFile(form.code, file, fieldId, tenantHost);
    if (uploaded?.url) {
      setAnswers((prev) => ({ ...prev, [fieldId]: uploaded.url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await storio.submitFormResponse(
        { form: form.code, answers },
        { tenantHost, throwOnError: true }
      );
      setStatus(form.settings?.successMessage || res?.message || 'Submitted successfully.');
    } catch (err) {
      setStatus(err instanceof StorioAPIError ? err.message : 'Submission failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{form.title}</h2>
      {form.elements.map((el) => (
        <div key={el.id} className="space-y-1">
          {el.label && <label className="block text-sm font-medium">{el.label}</label>}
          {el.type === 'file' || el.type === 'image' ? (
            <input type="file" onChange={(e) => handleFileChange(el.id, e.target.files?.[0])} />
          ) : (
            <input
              type={el.type === 'email' || el.type === 'number' || el.type === 'date' ? el.type : 'text'}
              required={el.required}
              placeholder={el.placeholder}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [el.id]: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
            />
          )}
        </div>
      ))}
      <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">
        {form.settings?.submitButtonText || 'Submit'}
      </button>
      {status && <p className="text-sm text-emerald-700">{status}</p>}
    </form>
  );
}
```

### Example 3: Citizen Charter & Compliance Page (`src/app/compliance/page.tsx`)

```tsx
import { headers } from 'next/headers';
import { storio } from '@storio/template-sdk';

export default async function CompliancePage() {
  const headersList = await headers();
  const host = (headersList.get('x-tenant-host') || headersList.get('host') || '').split(':')[0];
  const tenantHost = process.env.NEXT_PUBLIC_STORIO_TENANT_HOST || host;

  const [infoService, complaintOfficer, hotlines] = await Promise.all([
    storio.getInformationService(tenantHost),
    storio.getComplaintOfficer(tenantHost),
    storio.getHotlines(tenantHost),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-extrabold">Institutional Governance & Citizen Charter</h1>

      {infoService?.responsible_person && (
        <section className="p-6 bg-white border rounded-lg space-y-1">
          <h2 className="text-xl font-bold">{infoService.title || 'Information Service Center'}</h2>
          <p className="font-medium">{infoService.responsible_person}</p>
          <p className="text-sm text-gray-600">{infoService.designation}</p>
          <p className="text-sm text-gray-500">Email: {infoService.email} | Mobile: {infoService.mobile}</p>
          {Array.isArray(infoService.services_offered) && (
            <ul className="list-disc pl-5 text-sm pt-2">
              {infoService.services_offered.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {complaintOfficer?.name && (
        <section className="p-6 bg-white border rounded-lg space-y-2">
          <h2 className="text-xl font-bold">Grievance Redress Officer (GRS)</h2>
          <p className="font-medium">{complaintOfficer.name}</p>
          <p className="text-sm text-gray-600">{complaintOfficer.designation}</p>
          {Array.isArray(complaintOfficer.complaint_process) ? (
            <div className="space-y-1 text-sm">
              {complaintOfficer.complaint_process.map((step, i) => (
                <p key={step.step_number ?? i}>
                  Step {step.step_number ?? i + 1}: <strong>{step.title}</strong> — {step.description}
                </p>
              ))}
            </div>
          ) : complaintOfficer.complaint_process ? (
            <p className="text-sm whitespace-pre-line">{complaintOfficer.complaint_process}</p>
          ) : null}
        </section>
      )}

      {hotlines && hotlines.length > 0 && (
        <section className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Emergency Hotlines</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hotlines.map((h) => (
              <div key={h.id} className="p-3 bg-white rounded border text-center">
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
