# Storio Template SDK (v2) — Comprehensive Developer API & Data Reference Manual

Welcome 3rd-party template developers! 

This is the **complete, official API and Data Payload reference manual** for `@storio/template-sdk` (bundled in your starter template under `packages/storio-template-sdk-1.0.1.tgz`).

Every single SDK method, backend V2 endpoint path, method signature, parameter, TypeScript type interface, and exact JSON data payload structure from `packages/template-sdk/src/index.ts` is documented below.

---

## Table of Contents

1. [Quick Start & Setup](#1-quick-start--setup)
2. [Mandatory Rules for Template Developers](#mandatory-rules-for-template-developers)
   - [Rule 1: Tenant DB vs. Standalone Preview Mock Data Rule](#rule-1-tenant-db-vs-standalone-preview-mock-data-rule)
   - [Rule 2: Strict Typing Rule (No any Types Allowed)](#rule-2-strict-typing-rule-no-any-types-allowed)
3. [Complete SDK Method & Endpoint Index (36 Methods)](#2-complete-sdk-method--endpoint-index-36-methods)
4. [Detailed Method & Data Payload Reference](#4-detailed-method--data-payload-reference)
   - [Section 1: Site Identity & Layout Configs](#section-1-site-identity--layout-configs)
   - [Section 2: Hero Carousel Banners](#section-2-hero-carousel-banners)
   - [Section 3: Public Notice Board & Announcements](#section-3-public-notice-board--announcements)
   - [Section 4: Blogs & News Articles](#section-4-blogs--news-articles)
   - [Section 5: Faculty, Staff & Board Directory](#section-5-faculty-staff--board-directory)
   - [Section 6: Media Gallery & Photo Albums](#section-6-media-gallery--photo-albums)
   - [Section 7: School Activities & Events](#section-7-school-activities--events)
   - [Section 8: Dynamic CMS Custom Builder Pages](#section-8-dynamic-cms-custom-builder-pages)
   - [Section 9: Social Proof, Leadership & Promotions](#section-9-social-proof-leadership--promotions)
   - [Section 10: Quick Links, FAQs, Videos & Exam Results](#section-10-quick-links-faqs-videos--exam-results)
   - [Section 11: Careers & Recruitment](#section-11-careers--recruitment)
   - [Section 12: National Education Board Notice Sync](#section-12-national-education-board-notice-sync)
   - [Section 13: Online Admission Portal & Interactive Forms](#section-13-online-admission-portal--interactive-forms)
   - [Section 14: Core API Fetcher (`apiFetch`)](#section-14-core-api-fetcher-apifetch)
5. [Complete TypeScript Type Interfaces](#5-complete-typescript-type-interfaces)
6. [Next.js App Router Implementation Guide & Examples](#6-nextjs-app-router-implementation-guide--examples)

---

## 1. Quick Start & Setup

### Importing the SDK
In any Next.js **Server Component** or **Page** (`src/app/**/page.tsx`), import the `storio` singleton instance:

```typescript
import { storio } from '@storio/template-sdk';
```

### Key SDK Capabilities
- **Automatic Multi-Tenant Routing:** Automatically inspects incoming requests and attaches the `x-tenant-host` header to route data fetching to the correct institution backend.
- **Built-in Next.js Caching:** All GET requests automatically leverage Next.js caching (`revalidate: 60` seconds).
- **100% Strongly Typed:** Every method returns a typed Promise (`Promise<T | null>`).

---

## Mandatory Rules for Template Developers

> [!CAUTION]
> All template developers MUST strictly adhere to these two fundamental platform rules:

### Rule 1: Tenant DB vs. Standalone Preview Mock Data Rule

- **Standalone Preview (`localhost:3000` / `localhost:3004`)**:
  When accessed directly in local standalone mode, if the SDK returns empty data or `null`, fallback to `DEFAULT_DEMO_DATA` so you can visually inspect and style the UI layout.

- **Tenant Domain / Live Gateway (`school.com` / `school.localhost:3000` / `tenant.storio.cloud`)**:
  **STRICTLY DO NOT SHOW MOCK / DEMO DATA ON TENANT DOMAINS.** Only display real data returned from the tenant database via the SDK. If the tenant's database has 0 items, render a clean empty state or 0 items. Leaking demo data onto a live school's website is strictly forbidden.

#### Golden Code Pattern for Data Fetching:
```tsx
import { storio, StorioNotice } from '@storio/template-sdk';
import { headers } from 'next/headers';
import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';

export default async function NoticeSection() {
  // 1. Resolve Host & Tenant
  const headersList = await headers();
  const rawHost = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host = rawHost.split(':')[0];

  // 2. Determine Standalone Mode
  const isStandalone = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const tenantHost = isStandalone ? 'demo.storio.cloud' : host;

  // 3. Fetch Real Tenant Data via SDK
  const notices: StorioNotice[] | null = await storio.getNotices(tenantHost);

  // 4. Apply Tenant DB vs Standalone Mock Data Rule
  const finalNotices: StorioNotice[] = (Array.isArray(notices) && notices.length > 0)
    ? notices
    : (isStandalone ? DEFAULT_DEMO_DATA.notices : []);

  if (!finalNotices || finalNotices.length === 0) {
    return <div className="p-4 text-center text-gray-500">No notices posted.</div>;
  }

  return (
    <ul>
      {finalNotices.map((n) => (
        <li key={n.id}>{n.title}</li>
      ))}
    </ul>
  );
}
```

---

### Rule 2: Strict Typing Rule (No `any` Types Allowed)

> [!WARNING]
> **Zero `any` Types:** Avoid using the `any` TypeScript type in any file to prevent ESLint build failures (`@typescript-eslint/no-explicit-any`).

- Always use proper interfaces/types exported by `@storio/template-sdk` (e.g. `StorioSettingsResponse`, `StorioHeroSlide`, `StorioNotice`, `StorioBlogPost`, `StorioStaffMember`, etc.).
- For generic data dictionaries or unknown dynamic objects, use `Record<string, unknown>` or `unknown` instead of `any`.
- Examples:
  - Incorrect: `const data: any = await storio.getNotices();`
  - Correct: `const notices: StorioNotice[] | null = await storio.getNotices();`
  - Incorrect: `formData: any`
  - Correct: `formData: Record<string, unknown>`

---

## 2. Complete SDK Method & Endpoint Index (36 Methods)

| # | SDK Method Signature | HTTP | Endpoint Path | Return Type |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `storio.getSettings(host?)` | `GET` | `/api/v2/template/settings/` | `Promise<StorioSettingsResponse \| null>` |
| 2 | `storio.getCustomization(host?)` | `GET` | `/api/v2/template/customization/` | `Promise<StorioCustomizationResponse \| null>` |
| 3 | `storio.getNavigation(host?)` | `GET` | `/api/v2/template/navigation/` | `Promise<StorioNavigationResponse \| null>` |
| 4 | `storio.getLayout(host?)` | `GET` | `/api/v2/template/layout/` | `Promise<StorioLayoutResponse \| null>` |
| 5 | `storio.getInstitutionProfile(host?)` | `GET` | `/api/v2/template/institution-profile/` | `Promise<StorioInstitutionProfile \| null>` |
| 6 | `storio.getHeroSlides(host?)` | `GET` | `/api/v2/template/hero-slides/` | `Promise<StorioHeroSlide[] \| null>` |
| 7 | `storio.getNotices(host?)` | `GET` | `/api/v2/template/notices/` | `Promise<StorioNotice[] \| null>` |
| 8 | `storio.getNoticeDetail(id, host?)` | `GET` | `/api/v2/template/notices/${id}/` | `Promise<StorioNotice \| null>` |
| 9 | `storio.getBlogs(host?)` | `GET` | `/api/v2/template/blogs/` | `Promise<StorioBlogPost[] \| null>` |
| 10 | `storio.getBlogDetail(slug, host?)` | `GET` | `/api/v2/template/blogs/${slug}/` | `Promise<StorioBlogPost \| null>` |
| 11 | `storio.getStaff(host?)` | `GET` | `/api/v2/template/staff/` | `Promise<StorioStaffMember[] \| null>` |
| 12 | `storio.getTeam(host?)` | `GET` | `/api/v2/template/team/` | `Promise<StorioStaffMember[] \| null>` |
| 13 | `storio.getGallery(host?)` | `GET` | `/api/v2/template/gallery/` | `Promise<StorioGalleryItem[] \| null>` |
| 14 | `storio.getAlbums(host?)` | `GET` | `/api/v2/template/albums/` | `Promise<StorioAlbum[] \| null>` |
| 15 | `storio.getActivities(host?)` | `GET` | `/api/v2/template/activities/` | `Promise<StorioActivityItem[] \| null>` |
| 16 | `storio.getActivityDetail(slug, host?)` | `GET` | `/api/v2/template/activities/${slug}/` | `Promise<StorioActivityItem \| null>` |
| 17 | `storio.getEvents(host?)` / `getEventDetail()` | `GET` | `/api/events/` & `/api/events/${slugOrId}/` | `Promise<StorioEvent[] \| StorioEvent \| null>` |
| 18 | `storio.getPageBySlug(slug, host?)` | `GET` | `/api/v2/template/pages/by-slug/${slug}/` | `Promise<StorioCustomPage \| null>` |
| 19 | `storio.getTestimonials(host?)` | `GET` | `/api/v2/template/testimonials/` | `Promise<Record<string, unknown>[] \| null>` |
| 20 | `storio.getLeadershipMessages(host?)` | `GET` | `/api/v2/template/leadership-messages/` | `Promise<Record<string, unknown>[] \| null>` |
| 21 | `storio.getPromotions(host?)` | `GET` | `/api/v2/template/promotions/` | `Promise<StorioPromotion[] \| null>` |
| 22 | `storio.getImportantLinks(host?)` | `GET` | `/api/v2/template/important-links/` | `Promise<StorioImportantLink[] \| null>` |
| 23 | `storio.getFaqs(host?)` | `GET` | `/api/v2/template/faqs/` | `Promise<StorioFaq[] \| null>` |
| 24 | `storio.getVideos(host?)` | `GET` | `/api/v2/template/reels/` | `Promise<StorioVideoItem[] \| null>` |
| 25 | `storio.getCalendarEvents(host?)` | `GET` | `/api/v2/template/calendar/` | `Promise<StorioCalendarEvent[] \| null>` |
| 26 | `storio.getExamResults(host?)` | `GET` | `/api/v2/template/exam-results/` | `Promise<StorioExamResult[] \| null>` |
| 27 | `storio.getCareers(host?)` / `getJobDetail()` | `GET` | `/api/v2/template/careers/jobs/` & `.../${slug}/` | `Promise<Record<string, unknown>[] \| Record<string, unknown> \| null>` |
| 28 | `storio.getBoardNotices(host?)` | `GET` | `/api/v2/template/board-notices/` | `Promise<StorioBoardNotice[] \| null>` |
| 29 | `storio.getAdmissionFormConfig(host?)` | `GET` | `/api/v2/template/admission/form-config/current/` | `Promise<StorioAdmissionFormConfig \| null>` |
| 30 | `storio.sendAdmissionOTP(email, host?)` | `POST` | `/api/v2/template/admission/send-otp/` | `Promise<StorioAdmissionOTPResponse \| null>` |
| 31 | `storio.verifyAdmissionOTP(email, otpCode, host?)` | `POST` | `/api/v2/template/admission/verify-otp/` | `Promise<StorioAdmissionOTPResponse \| null>` |
| 32 | `storio.submitAdmissionApplication(formData, otpCode, host?)` | `POST` | `/api/v2/template/admission/applications/` | `Promise<StorioAdmissionApplicationResponse \| null>` |
| 33 | `storio.submitContactMessage(formData, host?)` | `POST` | `/api/v2/template/contact/` | `Promise<StorioContactFormResponse \| null>` |
| 34 | `storio.apiFetch<T>(endpoint, options?)` | `GET/POST` | `*` | `Promise<T \| null>` |

---

## 3. Detailed Method & Data Payload Reference

### Section 1: Site Identity & Layout Configs

#### 1. `storio.getSettings(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/settings/`
- **Description:** Returns general site identity metadata like site title, tagline, branding logos, contact info, and social media links.
- **Data Payload Obtained:**
  ```json
  {
    "site_title": "Sample Institution",
    "site_tagline": "Empowering Leaders of Tomorrow",
    "logo_url": "https://example.com/logo.png",
    "favicon_url": "https://example.com/favicon.ico",
    "contact_email": "contact@example.com",
    "phone_number": "+000 0000-000000",
    "social_links": [
      { "platform": "facebook", "url": "https://example.com/social" },
      { "platform": "youtube", "url": "https://example.com/youtube" }
    ],
    "mailing_address": "123 Campus Street, City, Country",
    "hcaptcha_site_key": "YOUR_HCAPTCHA_SITE_KEY"
  }
  ```

#### 2. `storio.getCustomization(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/customization/`
- **Description:** Returns theme colors, typography fonts, and feature flags saved by the admin in the CMS dashboard.
- **Data Payload Obtained:**
  ```json
  {
    "config": {
      "primaryColor": "#047857",
      "secondaryColor": "#065f46",
      "accentColor": "#f59e0b",
      "fontFamily": "Inter",
      "showHeroSlider": true,
      "showNoticeTicker": true,
      "showStaffSection": true
    }
  }
  ```

#### 3. `storio.getNavigation(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/navigation/`
- **Description:** Returns header navbar navigation structure with nested sub-menus.
- **Data Payload Obtained:**
  ```json
  {
    "items": [
      { "id": "1", "label": "Home", "url": "/", "target": "_self" },
      { 
        "id": "2", 
        "label": "About", 
        "url": "/about", 
        "children": [
          { "id": "2-1", "label": "Mission & Vision", "url": "/about#mission" },
          { "id": "2-2", "label": "Faculty & Staff", "url": "/staff" }
        ]
      },
      { "id": "3", "label": "Notices", "url": "/notice" },
      { "id": "4", "label": "Contact", "url": "/contact" }
    ]
  }
  ```

#### 4. `storio.getLayout(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/layout/`
- **Description:** Combined endpoint that returns `settings`, `customization`, and `navigation` in a single response to optimize initial page loading speed.
- **Data Payload Obtained:**
  ```json
  {
    "settings": { /* StorioSettingsResponse */ },
    "customization": { /* StorioCustomizationResponse */ },
    "navigation": { /* StorioNavigationResponse */ }
  }
  ```

#### 5. `storio.getInstitutionProfile(tenantHostOrOptions?)`
- **Endpoint:** `GET /api/v2/template/institution-profile/`
- **Description:** Comprehensive institutional metadata including EIIN, school code, student/teacher counts, mission, vision, and key metrics.
- **Data Payload Obtained:**
  ```json
  {
    "id": 1,
    "institution_image_url": "https://example.com/campus.jpg",
    "eiin": 123456,
    "school_code": "SCH-100",
    "school_shift": "Morning & Day",
    "school_type": "Higher Secondary",
    "division": "Division Name",
    "district": "District Name",
    "upazila": "Upazila Name",
    "school_details": "Established institution providing quality education...",
    "total_students": 1000,
    "total_teachers": 50,
    "total_students_label": "Active Students",
    "total_teachers_label": "Qualified Educators",
    "mission": "To provide transformative education inspiring excellence.",
    "vision": "Building future leaders with character and competence.",
    "important_links": [
      { "label": "Education Board", "url": "https://example.com/board" }
    ]
  271: ### Section 2: Hero Carousel Banners
272: 
273: #### 6. `storio.getHeroSlides(tenantHostOrOptions?)`
274: - **Endpoint:** `GET /api/v2/template/hero-slides/`
275: - **Description:** Homepage top banner slider images with overlay headings, subtitles, ordering, and call-to-action buttons.
276: - **Data Payload Obtained (Array):**
277:   ```json
278:   [
279:     {
280:       "id": 1,
281:       "title": "Welcome to Our Institution",
282:       "subtitle": "Inspiring Minds, Shaping Futures",
283:       "image_url": "https://example.com/hero1.jpg",
284:       "button_text": "Apply Now",
285:       "button_url": "/admission",
286:       "order": 1
287:     },
288:     {
289:       "id": 2,
290:       "title": "State of the Art Facilities",
291:       "subtitle": "Discover practical knowledge and innovation.",
292:       "image_url": "https://example.com/hero2.jpg",
293:       "button_text": "Explore Facilities",
294:       "button_url": "/facilities",
295:       "order": 2
296:     }
297:   ]
298:   ```
299: 
300: ---
301: 
302: ### Section 3: Public Notice Board & Announcements
303: 
304: #### 7. `storio.getNotices(tenantHostOrOptions?)`
305: - **Endpoint:** `GET /api/v2/template/notices/`
306: - **Description:** Fetches list of public notice board announcements.
307: - **Data Payload Obtained (Array):**
308:   ```json
309:   [
310:     {
311:       "id": 101,
312:       "title": "Annual Event Schedule & Guidelines",
313:       "slug": "annual-event-schedule",
314:       "published_date": "2026-02-10",
315:       "is_urgent": true,
316:       "attachment_url": "https://example.com/notice.pdf"
317:     }
318:   ]
319:   ```
320: 
321: #### 8. `storio.getNoticeDetail(id, tenantHostOrOptions?)`
322: - **Endpoint:** `GET /api/v2/template/notices/${id}/`
323: - **Description:** Single notice detail view containing complete HTML/markdown content.
324: - **Data Payload Obtained:**
325:   ```json
326:   {
327:     "id": 101,
328:     "title": "Annual Event Schedule & Guidelines",
329:     "content": "<p>All students and guardians are hereby notified that...</p>",
330:     "published_date": "2026-02-10",
331:     "is_urgent": true,
332:     "attachment_url": "https://example.com/notice.pdf"
333:   }
334:   ```
335: 
336: ---
337: 
338: ### Section 4: Blogs & News Articles
339: 
340: #### 9. `storio.getBlogs(tenantHostOrOptions?)`
341: - **Endpoint:** `GET /api/v2/template/blogs/`
342: - **Description:** List of published blog articles and news stories.
343: - **Data Payload Obtained (Array):**
344:   ```json
345:   [
346:     {
347:       "id": 12,
348:       "title": "Modern Approaches in Education",
349:       "slug": "modern-approaches-in-education",
350:       "summary": "Exploring interactive learning techniques.",
351:       "featured_image_url": "https://example.com/blog.jpg",
352:       "category_name": "Education",
353:       "published_at": "2026-01-15T10:00:00Z"
354:     }
355:   ]
356:   ```
357: 
358: #### 10. `storio.getBlogDetail(slug, tenantHostOrOptions?)`
359: - **Endpoint:** `GET /api/v2/template/blogs/${slug}/`
360: - **Description:** Full article details by slug for single blog post pages.
361: - **Data Payload Obtained:**
362:   ```json
363:   {
364:     "id": 12,
365:     "title": "Modern Approaches in Education",
366:     "slug": "modern-approaches-in-education",
367:     "summary": "Exploring interactive learning techniques.",
368:     "content": "<p>Educational practices are rapidly evolving...</p>",
369:     "featured_image_url": "https://example.com/blog.jpg",
370:     "category_name": "Education",
371:     "published_at": "2026-01-15T10:00:00Z"
372:   }
373:   ```
374: 
375: ---
376: 
377: ### Section 5: Faculty, Staff & Board Directory
378: 
379: #### 11. `storio.getStaff(tenantHostOrOptions?)`
380: - **Endpoint:** `GET /api/v2/template/staff/`
381: - **Description:** Teachers and administrative staff directory.
382: - **Data Payload Obtained (Array):**
383:   ```json
384:   [
385:     {
386:       "id": 5,
387:       "name": "Jane Doe",
388:       "designation": "Head of Science Department",
389:       "department": "Science",
390:       "photo_url": "https://example.com/staff.jpg",
391:       "email": "staff@example.com",
392:       "phone_number": "+000 0000-000000",
393:       "bio": "Educator with extensive academic experience."
394:     }
395:   ]
396:   ```
397: 
398: #### 12. `storio.getTeam(tenantHostOrOptions?)`
399: - **Endpoint:** `GET /api/v2/template/team/`
400: - **Description:** Managing committee, governing body, and board of directors profiles.
401: - **Data Payload Obtained (Array):** Same schema as `StorioStaffMember[]`.
402: 
403: ---
404: 
405: ### Section 6: Media Gallery & Photo Albums
406: 
407: #### 13. `storio.getGallery(tenantHostOrOptions?)`
408: - **Endpoint:** `GET /api/v2/template/gallery/`
409: - **Description:** Individual campus photos grid.
410: - **Data Payload Obtained (Array):**
411:   ```json
412:   [
413:     {
414:       "id": 88,
415:       "title": "Annual Exhibition",
416:       "image_url": "https://example.com/gallery.jpg",
417:       "caption": "Students displaying projects."
418:     }
419:   ]
420:   ```
421: 
422: #### 14. `storio.getAlbums(tenantHostOrOptions?)`
423: - **Endpoint:** `GET /api/v2/template/albums/`
424: - **Description:** Photo albums with cover image and nested array of photos.
425: - **Data Payload Obtained (Array):**
426:   ```json
427:   [
428:     {
429:       "id": 10,
430:       "title": "Campus Celebration",
431:       "cover_image_url": "https://example.com/album-cover.jpg",
432:       "images": [
433:         { "id": 101, "image_url": "https://example.com/img1.jpg", "title": "Event Highlight" }
434:       ]
435:     }
436:   ]
437:   ```
438: 
439: ---
440: 
441: ### Section 7: School Activities & Events
442: 
443: #### 15. `storio.getActivities(tenantHostOrOptions?)`
444: - **Endpoint:** `GET /api/v2/template/activities/`
445: - **Description:** List of co-curricular activities, workshops, and student clubs.
446: 
447: #### 16. `storio.getActivityDetail(slug, tenantHostOrOptions?)`
448: - **Endpoint:** `GET /api/v2/template/activities/${slug}/`
449: - **Description:** Single activity detail page content.
450: 
451: #### 17. `storio.getEvents(tenantHostOrOptions?)` & `storio.getEventDetail(slugOrId, tenantHostOrOptions?)`
452: - **Endpoint:** `GET /api/events/` & `GET /api/events/${slugOrId}/`
453: - **Description:** Institutional events with dates, map location, categories, and event status.
454: - **Data Payload Obtained:**
455:   ```json
456:   [
457:     {
458:       "id": 4,
459:       "title": "Annual Competition",
460:       "slug": "annual-competition",
461:       "content": "Event competition schedule...",
462:       "location": "Main Auditorium",
463:       "start_date": "2026-03-01T09:00:00Z",
464:       "end_date": "2026-03-02T17:00:00Z",
465:       "status": "Upcoming",
466:       "is_featured": true,
467:       "featured_image": "https://example.com/event.jpg"
468:     }
469:   ]
470:   ```
471: 
472: ---
473: 
474: ### Section 8: Dynamic CMS Custom Builder Pages
475: 
476: #### 18. `storio.getPageBySlug(slug, tenantHostOrOptions?)`
477: - **Endpoint:** `GET /api/v2/template/pages/by-slug/${slug}/`
478: - **Description:** Fetches custom dynamic pages constructed via CMS page builder.
479: - **Data Payload Obtained:**
480:   ```json
481:   {
482:     "id": 45,
483:     "title": "About Us",
484:     "slug": "about-us",
485:     "content": "<div className=\"custom-page\">Institution overview content...</div>",
486:     "meta_title": "About Us",
487:     "meta_description": "Learn about our institution.",
488:     "featured_image": "https://example.com/about.jpg"
489:   }
490:   ```
491: 
492: ---
493: 
494: ### Section 9: Social Proof, Leadership & Promotions
495: 
496: #### 19. `storio.getTestimonials(tenantHostOrOptions?)`
497: - **Endpoint:** `GET /api/v2/template/testimonials/`
498: - **Description:** Array of parent, student, and alumni testimonials.
499: 
500: #### 20. `storio.getLeadershipMessages(tenantHostOrOptions?)`
501: - **Endpoint:** `GET /api/v2/template/leadership-messages/`
502: - **Description:** Formal welcome messages from leadership.
503: 
504: #### 21. `storio.getPromotions(tenantHostOrOptions?)`
505: - **Endpoint:** `GET /api/v2/template/promotions/`
506: - **Description:** Promotional banners, badge text, cards, and action links.
507: - **Data Payload Obtained (Array):**
508:   ```json
509:   [
510:     {
511:       "id": 3,
512:       "title": "Admissions Open",
513:       "subtitle": "Scholarship Opportunities Available",
514:       "badge_text": "Admissions",
515:       "image": "https://example.com/promo.jpg",
516:       "cta_label": "Apply Online",
517:       "cta_url": "/admission",
518:       "cta_is_external": false
519:     }
520:   ]
521:   ```
522: 
523: ---
524: 
525: ### Section 10: Quick Links, FAQs, Videos & Exam Results
526: 
527: #### 22. `storio.getImportantLinks(tenantHostOrOptions?)`
528: - **Endpoint:** `GET /api/v2/template/important-links/`
529: - **Description:** External portal links.
530: 
531: #### 23. `storio.getFaqs(tenantHostOrOptions?)`
532: - **Endpoint:** `GET /api/v2/template/faqs/`
533: - **Description:** Accordion list of frequently asked questions and answers.
534: 
535: #### 24. `storio.getVideos(tenantHostOrOptions?)`
536: - **Endpoint:** `GET /api/v2/template/reels/`
537: - **Description:** Embedded video reels with likes and view counts.
538: 
539: #### 25. `storio.getCalendarEvents(tenantHostOrOptions?)`
540: - **Endpoint:** `GET /api/v2/template/calendar/`
541: - **Description:** Academic term calendar events and public holidays.
542: 
543: #### 26. `storio.getExamResults(tenantHostOrOptions?)`
544: - **Endpoint:** `GET /api/v2/template/exam-results/`
545: - **Description:** National board exam pass rates and downloadable PDF result sheets.
546: - **Data Payload Obtained (Array):**
547:   ```json
548:   [
549:     {
550:       "id": 7,
551:       "exam_name": "Board Examination",
552:       "class_name": "Class 10",
553:       "year": 2025,
554:       "total_examinees": 200,
555:       "passed": 198,
556:       "failed": 2,
557:       "pass_rate": "99.0%",
558:       "exam_type": "Board Exam",
559:       "file_url": "https://example.com/result.pdf"
560:     }
561:   ]
562:   ```
563: 
564: ---
565: 
566: ### Section 11: Careers & Recruitment
567: 
568: #### 27. `storio.getCareers(tenantHostOrOptions?)` & `storio.getJobDetail(slug, tenantHostOrOptions?)`
569: - **Endpoint:** `GET /api/v2/template/careers/jobs/` & `/api/v2/template/careers/jobs/${slug}/`
570: - **Description:** Active teacher/staff job openings, requirements, and deadlines.
571: 
572: ---
573: 
574: ### Section 12: National Education Board Notice Sync
575: 
576: #### 28. `storio.getBoardNotices(tenantHostOrOptions?)`
577: - **Endpoint:** `GET /api/v2/template/board-notices/`
578: - **Description:** Auto-synced notices from national education boards.
579: - **Data Payload Obtained (Array):**
580:   ```json
581:   [
582:     {
583:       "id": 15,
584:       "title": "Board Exam Routine Update",
585:       "publish_date": "2026-02-05",
586:       "url": "https://example.com/notice/15",
587:       "board": "Education Board"
588:     }
589:   ]
590:   ```
591: 
592: ---
593: 
594: ### Section 13: Online Admission Portal & Interactive Forms
595: 
596: #### 29. `storio.getAdmissionFormConfig(tenantHostOrOptions?)`
597: - **Endpoint:** `GET /api/v2/template/admission/form-config/current/`
598: - **Description:** Schema configuration for generating dynamic admission forms.
599: - **Data Payload Obtained:**
600:   ```json
601:   {
602:     "id": 1,
603:     "is_active": true,
604:     "fields": [
605:       { "id": "student_name", "label": "Applicant Full Name", "type": "text", "required": true },
606:       { "id": "applied_class", "label": "Target Class", "type": "select", "options": ["Class 6", "Class 7", "Class 8", "Class 9", "Class 11"], "required": true },
607:       { "id": "guardian_phone", "label": "Guardian Phone Number", "type": "tel", "required": true }
608:     ]
609:   }
610:   ```
611: 
612: #### 30. `storio.sendAdmissionOTP(email, tenantHostOrOptions?)`
613: - **Endpoint:** `POST /api/v2/template/admission/send-otp/`
614: - **Payload Sent:** `{ "email": "applicant@example.com" }`
615: - **Data Returned:** `{ "success": true, "message": "OTP verification code sent to your email." }`
616: 
617: #### 31. `storio.verifyAdmissionOTP(email, otpCode, tenantHostOrOptions?)`
618: - **Endpoint:** `POST /api/v2/template/admission/verify-otp/`
619: - **Payload Sent:** `{ "email": "applicant@example.com", "otp_code": "123456" }`
620: - **Data Returned:** `{ "success": true, "message": "OTP verified successfully." }`
621: 
622: #### 32. `storio.submitAdmissionApplication(formData, otpCode, tenantHostOrOptions?)`
623: - **Endpoint:** `POST /api/v2/template/admission/applications/`
624: - **Payload Sent:** `{ "form_data": { ... }, "otp_code": "123456" }`
625: - **Data Returned:** `{ "success": true, "application_number": "APP-2026-00001", "message": "Application submitted successfully!" }`
626: 
627: #### 33. `storio.submitContactMessage(formData, tenantHostOrOptions?)`
628: - **Endpoint:** `POST /api/v2/template/contact/`
629: - **Payload Sent:** `{ "name": "John Doe", "email": "visitor@example.com", "message": "Hello" }`
630: - **Data Returned:** `{ "success": true, "message": "Your message has been sent." }`

---

### Section 14: Core API Fetcher (`apiFetch`)

#### 34. `storio.apiFetch<T>(endpoint, options?)`
- **Signature:** `apiFetch<T>(endpoint: string, options?: StorioFetchOptions): Promise<T | null>`
- **Description:** Low-level fetch wrapper used internally by all SDK methods. Use this if you need to fetch a custom endpoint not covered by built-in methods.

---

## 4. Complete TypeScript Type Interfaces

Here are all 29 TypeScript interfaces exported directly by `@storio/template-sdk`:

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

export interface StorioLayoutResponse {
  settings: StorioSettingsResponse;
  customization: StorioCustomizationResponse;
  navigation: StorioNavigationResponse;
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
  created_at?: string;
  updated_at?: string;
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
```

---

## 6. Next.js App Router Implementation Guide & Examples

### Example 1: Complete Server Homepage (`src/app/page.tsx`)

This example demonstrates the complete **4-step Golden Rule** pattern for resolving the host header, determining standalone mode, fetching SDK data, and applying mock data fallbacks safely.

```tsx
import { 
  storio, 
  StorioLayoutResponse, 
  StorioHeroSlide, 
  StorioNotice 
} from '@storio/template-sdk';
import { headers } from 'next/headers';
import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';

export default async function HomePage() {
  // 1. RESOLVE HOST & TENANT DOMAIN
  const headersList = await headers();
  const rawHost: string = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host: string = rawHost.split(':')[0];

  // 2. DETERMINE STANDALONE MODE
  const isStandalone: boolean = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const tenantHost: string = isStandalone ? 'demo.storio.cloud' : host;

  // 3. FETCH REAL TENANT DATA VIA SDK
  const [rawLayout, rawHeroSlides, rawNotices] = await Promise.all([
    storio.getLayout(tenantHost),
    storio.getHeroSlides(tenantHost),
    storio.getNotices(tenantHost),
  ]);

  // 4. APPLY THE GOLDEN RULE (Standalone Demo Data vs Tenant DB Real Data)
  // If real tenant data exists -> use real DB data.
  // If database has 0 items -> use DEFAULT_DEMO_DATA ONLY IF isStandalone is true; else return empty state.
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

  // 1. Resolve Host & Tenant Domain
  const headersList = await headers();
  const rawHost: string = headersList.get('x-tenant-host') || headersList.get('host') || '';
  const host: string = rawHost.split(':')[0];

  // 2. Determine Standalone Mode
  const isStandalone: boolean = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const tenantHost: string = isStandalone ? 'demo.storio.cloud' : host;

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

