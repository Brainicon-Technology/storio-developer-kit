# Storio Template Manifest Guide (`storio.template.json`)

This document is written for 3rd-party developers creating custom templates for the Storio platform. It explains the purpose, structure, and configuration options of the `storio.template.json` manifest file.

---

## Overview: What is `storio.template.json`?

The `storio.template.json` file is the **communication bridge** between your Next.js template and the Storio CMS backend. 

### Why is it needed?
When a school administrator logs into the Storio CMS dashboard, they need to be able to change colors, typography, toggle UI sections (like a Hero slider), and manage their navigation menu. However, the Storio backend doesn't inherently know *what* your specific Next.js template allows them to change. 

The manifest file solves this by explicitly declaring to the backend:
1. **Customization Schema:** What inputs to show in the "Template Customization" UI (e.g., color pickers, text inputs).
2. **Supported Features:** Which CMS modules (like Blogs or Admissions) this template supports.
3. **Navigation Seed:** What the default navigation menu should look like upon fresh installation.

### How it works (The Lifecycle)
1. **Placement:** You write the JSON file and place it in your `public/` folder.
2. **Deployment:** When you submit/upload your template to the Storio platform, the Storio backend automatically detects and reads this manifest file from your repository.
3. **Dynamic UI Generation:** The Storio backend parses the JSON and **dynamically generates the CMS Dashboard UI** for schools that install your template.
4. **Validation:** If you forget to include this file, the Storio platform will reject the template with an error: *"This template does not have a valid storio.template.json manifest registered."*

> [!NOTE]
> **Important Note on Local Testing:** 
> Because you are developing your frontend locally in "Standalone Preview" mode, you do not have the Storio CMS backend running on your computer. Therefore, you **cannot** see or test the Storio Admin Dashboard locally, and your Next.js app does not actively use this JSON file while running on `localhost`. 
>
> You are writing this manifest purely as a **deployment contract**. When you submit your completed template to the Storio platform, the live backend will read this file and generate the CMS dashboard for schools that install your template. To test if your CSS/customizations actually work locally, you should manually alter your mock SDK data (e.g., in `DEFAULT_DEMO_DATA`) to simulate what the live CMS *would* send.

---

## Configuration Reference

Here is a complete breakdown of the available options you can configure in the manifest.

### 1. Core Identity Options
This section identifies your template to the platform.

```json
"id": "template-1-starter",
"name": "My Starter Template",
"version": "1.0.0"
```
- **`id`**: A unique string identifier for your template assigned by the Storio platform.
- **`name`**: The human-readable name of your template.
- **`version`**: Semantic versioning for your template.

---

### 2. Customization Schema
This section defines the input fields that will dynamically render in the school administrator's **Template Customization** page in the CMS.

```json
"customization": {
  "colors": [
    { "id": "primaryColor", "label": "Primary Color", "type": "color", "default": "#0e704b" },
    { "id": "backgroundColor", "label": "Background Color", "type": "color", "default": "#f8f4e7" },
    { "id": "surfaceColor", "label": "Surface Color", "type": "color", "default": "#ffffff" },
    { "id": "textColor", "label": "Text Color", "type": "color", "default": "#3a3a41" },
    { "id": "headingColor", "label": "Heading Color", "type": "color", "default": "#3a3a41" },
    { "id": "footerColor", "label": "Footer Color", "type": "color", "default": "#101828" },
    { "id": "accentColor", "label": "Accent Color", "type": "color", "default": "#0e704b" },
    { "id": "buttonColor", "label": "Button Color", "type": "color", "default": "#0e704b" },
    { "id": "buttonTextColor", "label": "Button Text Color", "type": "color", "default": "#f8f4e7" },
    { "id": "buttonHoverColor", "label": "Button Hover Color", "type": "color", "default": "#b62309" },
    { "id": "buttonTextHoverColor", "label": "Button Text Hover Color", "type": "color", "default": "#f8f4e7" },
    { "id": "activeNavBgColor", "label": "Active Nav BG Color", "type": "color", "default": "#f0f7ef" },
    { "id": "activeNavTextColor", "label": "Active Nav Text Color", "type": "color", "default": "#0e704b" }
  ],
  "typography": [
    { "id": "fontFamily", "label": "Body Font", "type": "text", "default": "Roboto" }
  ],
  "layout": [
    { "id": "borderRadius", "label": "Border Radius", "type": "text", "default": "8px" }
  ],
  "content": [
    { "id": "showHero", "label": "Show Hero Section", "type": "boolean", "default": true },
    { "id": "heroHeadline", "label": "Hero Headline", "type": "text", "default": "Welcome to Our Institution" },
    { 
      "id": "headerStyle", 
      "label": "Header Style", 
      "type": "select", 
      "options": [
        { "label": "Classic", "value": "classic" },
        { "label": "Modern", "value": "modern" },
        { "label": "Minimal", "value": "minimal" }
      ],
      "default": "modern" 
    }
  ]
}
```

- **Categories:** Organize settings into `colors`, `typography`, `layout`, and `content`.
- **Available Input Types:**
  - `color`: Renders a color picker.
  - `text`: Renders a standard text input field.
  - `boolean`: Renders a toggle/checkbox.
  - `select`: Renders a dropdown menu (requires providing an `options` array).
- **How it integrates:** When the admin changes "Primary Color" in the CMS, it saves to the tenant's database. Your Next.js app then fetches it via the SDK using `storio.getCustomization()` and you apply it to your CSS!

---

### 3. Features Array
This is a list of CMS modules that your template actually supports. 

```json
"features": [
  "notice",
  "blogs",
  "gallery",
  "faq",
  "heroSlide",
  "reels",
  "activity",
  "mediaFile",
  "careers",
  "testimonial",
  "contact",
  "staff",
  "team",
  "leadership_message",
  "important_links",
  "socialLink",
  "institution_profile",
  "accounts",
  "auth",
  "generalSettings",
  "template_customization",
  "formbuilder",
  "custom_pages",
  "promotions",
  "admission",
  "exam_results",
  "calendar_events",
  "events",
  "academics",
  "compliance"
]
```

**Available Feature Flags & Modules (All 30 Supported Features):**

Below is the complete reference of all 30 feature modules that can be declared in your `storio.template.json` manifest:

1. `"notice"`: Public notices, circulars, urgent announcements, and downloadable attachments (PDF/images) with pinned/urgent flags.
2. `"blogs"`: School news, editorial articles, blog posts, press releases, categories, and tags.
3. `"gallery"`: Photo albums, categorized image galleries, event photo collections, and responsive lightboxes.
4. `"faq"`: Frequently asked questions and expandable accordion Q&A pairs for parents and students.
5. `"heroSlide"`: Homepage hero carousel banners, promotional slides, taglines, call-to-action buttons, and background images.
6. `"reels"`: Embedded short-form video reels and video highlights (YouTube, Vimeo, Facebook video).
7. `"activity"`: School sports, clubs, co-curricular programs, cultural activities, and student event archives.
8. `"mediaFile"`: Centralized media library manager allowing administrators to upload, manage, and reuse images, documents, and assets.
9. `"careers"`: Job vacancy listings, career postings, requirements, and job application management.
10. `"testimonial"`: Testimonials and reviews from alumni, parents, students, community leaders, and donors.
11. `"contact"`: Public contact form submissions, general inquiry inbox, and school office contact information.
12. `"staff"`: Teachers, faculty directory, designations, academic departments, qualifications, and teacher profiles.
13. `"team"`: School administration, governing body members, managing committee, board of trustees, and executive leadership profiles.
14. `"leadership_message"`: Official public messages and speeches from the Principal, Headmaster, Chairman, or Founder.
15. `"important_links"`: Quick reference external web links to education boards, ministry portals, curriculum sites, and public resources.
16. `"socialLink"`: Institutional social media channel links (Facebook, YouTube, X/Twitter, Instagram, LinkedIn).
17. `"institution_profile"`: Core institutional identity, school registration code, EIIN number, establishment year, campus address, mission, and vision statements.
18. `"accounts"`: User account management, staff administration, role assignments, and dashboard access permissions.
19. `"auth"`: Secure authentication system, admin/staff login, password recovery, session handling, and security controls.
20. `"generalSettings"`: Global institution configurations, site title, tagline, branding logos, favicon, contact email/phone numbers, mailing address, SEO metadata, and hCaptcha keys.
21. `"template_customization"`: Visual theme customization panel allowing school administrators to configure primary/secondary colors, fonts, layout styles, and section toggles defined in the manifest.
22. `"formbuilder"`: Dynamic custom form generator for creating online registration forms, feedback surveys, event signups, and custom inquiries.
23. `"custom_pages"`: Dynamic CMS pages created and published by administrators with rich-text content (e.g. `/page/about-us`, `/page/campus-history`, `/page/rules-regulations`).
24. `"promotions"`: Promotional popups, modal alerts, and seasonal announcement banners displayed across the public site.
25. `"admission"`: Online student admission portal, intake forms, email OTP verification, and application processing dashboard.
26. `"exam_results"`: Published board results, term exam results, pass rates, GPA analytics, and downloadable grade sheet PDFs.
27. `"calendar_events"`: Interactive academic calendar, holidays, semester milestones, and examination schedules.
28. `"events"`: Campus events, annual sports days, cultural festivals, workshops, and event registration.
29. `"academics"`: Comprehensive academic management suite:
    - **Class Routines:** Weekly period schedules, subject assignments, teacher allocations, room numbers, and downloadable routine PDFs.
    - **Syllabuses:** Term/annual examination syllabuses, marked chapters, and downloadable PDF documents.
    - **Student Statistics:** Aggregated student body demographics, gender distribution (male/female/total), section counts, and class-wise stream/group distributions (Science, Arts, Commerce).
30. `"compliance"`: Government and regulatory governance suite:
    - **MPO Information:** Monthly Pay Order government accreditation, MPO code, order numbers, gazette dates, and teacher statistics (MPO vs Non-MPO).
    - **Information Service Center:** Right to Information (RTI / তথ্য অধিকার) desk details, designated officer contact cards, and listed public services.
    - **Complaint Officer:** Grievance Redress System (GRS / অভিযোগ প্রতিকার ব্যবস্থা) focal point officer details and official step-by-step grievance resolution process.
    - **Emergency Hotlines:** Quick-dial national emergency helplines (999, 333, 1098) and custom campus security numbers.

**Why is this important?** 
If your template doesn't have a "Careers" or "Academics" page built into it, you shouldn't confuse the admin by showing them those managers in their CMS dashboard. By omitting a feature from this array, the Storio backend will safely and automatically hide that entire module from the admin panel.

---

### 4. Navigation Seed
When a school installs your template for the very first time, they need a starting point for their navigation menu.

```json
"navigation": [
  {
    "id": "navbarLinks",
    "label": "Navigation Links",
    "type": "links",
    "default": [
      {
        "id": "1",
        "name": "Home",
        "href": "/"
      },
      {
        "id": "2",
        "name": "About Us",
        "href": "/about",
        "subLinks": [
          { "id": "2-1", "name": "Institution Profile", "href": "/about/institution" }
        ]
      }
    ]
  }
]
```
- The Storio CMS will read this array upon fresh template installation and pre-populate the school's Navigation Builder. 
- You can provide nested dropdown menus by utilizing the `subLinks` array within a link object.

---

## 5. Complete Example (`storio.template.json`)

Here is what a complete, fully configured `storio.template.json` file looks like when all pieces are put together. You can use this as a reference or a starting boilerplate for your own template:

```json
{
    "id": "template-1-starter",
    "name": "My Starter Template",
    "version": "1.0.0",
    "customization": {
        "colors": [
            {
                "id": "primaryColor",
                "label": "Primary Color",
                "type": "color",
                "default": "#0e704b"
            },
            {
                "id": "backgroundColor",
                "label": "Background Color",
                "type": "color",
                "default": "#f8f4e7"
            },
            {
                "id": "surfaceColor",
                "label": "Surface Color",
                "type": "color",
                "default": "#ffffff"
            },
            {
                "id": "textColor",
                "label": "Text Color",
                "type": "color",
                "default": "#3a3a41"
            },
            {
                "id": "headingColor",
                "label": "Heading Color",
                "type": "color",
                "default": "#3a3a41"
            },
            {
                "id": "footerColor",
                "label": "Footer Color",
                "type": "color",
                "default": "#101828"
            },
            {
                "id": "accentColor",
                "label": "Accent Color",
                "type": "color",
                "default": "#0e704b"
            },
            {
                "id": "buttonColor",
                "label": "Button Color",
                "type": "color",
                "default": "#0e704b"
            },
            {
                "id": "buttonTextColor",
                "label": "Button Text Color",
                "type": "color",
                "default": "#f8f4e7"
            },
            {
                "id": "buttonHoverColor",
                "label": "Button Hover Color",
                "type": "color",
                "default": "#b62309"
            },
            {
                "id": "buttonTextHoverColor",
                "label": "Button Text Hover Color",
                "type": "color",
                "default": "#f8f4e7"
            },
            {
                "id": "activeNavBgColor",
                "label": "Active Nav BG Color",
                "type": "color",
                "default": "#f0f7ef"
            },
            {
                "id": "activeNavTextColor",
                "label": "Active Nav Text Color",
                "type": "color",
                "default": "#0e704b"
            }
        ],
        "typography": [
            {
                "id": "fontFamily",
                "label": "Body Font",
                "type": "text",
                "default": "Roboto"
            }
        ],
        "layout": [
            {
                "id": "borderRadius",
                "label": "Border Radius",
                "type": "text",
                "default": "8px"
            }
        ],
        "content": [
            {
                "id": "showHero",
                "label": "Show Hero Section",
                "type": "boolean",
                "default": true
            },
            {
                "id": "heroHeadline",
                "label": "Hero Headline",
                "type": "text",
                "default": "Welcome to Our Institution"
            },
            {
                "id": "headerStyle",
                "label": "Header Style",
                "type": "select",
                "options": [
                    {
                        "label": "Classic",
                        "value": "classic"
                    },
                    {
                        "label": "Modern",
                        "value": "modern"
                    },
                    {
                        "label": "Minimal",
                        "value": "minimal"
                    }
                ],
                "default": "modern"
            }
        ]
    },
    "features": [
        "notice",
        "blogs",
        "gallery",
        "faq",
        "heroSlide",
        "reels",
        "activity",
        "mediaFile",
        "careers",
        "testimonial",
        "contact",
        "staff",
        "team",
        "leadership_message",
        "important_links",
        "socialLink",
        "institution_profile",
        "accounts",
        "auth",
        "generalSettings",
        "template_customization",
        "formbuilder",
        "custom_pages",
        "promotions",
        "admission",
        "exam_results",
        "calendar_events",
        "events",
        "academics",
        "compliance"
    ],
    "navigation": [
        {
            "id": "navbarLinks",
            "label": "Navigation Links",
            "type": "links",
            "default": [
                {
                    "id": "1",
                    "name": "Home",
                    "href": "/"
                },
                {
                    "id": "2",
                    "name": "About Us",
                    "href": "/about",
                    "subLinks": [
                        {
                            "id": "2-1",
                            "name": "Institution Profile",
                            "href": "/about/institution"
                        },
                        {
                            "id": "2-2",
                            "name": "School Information",
                            "href": "/about/schoolInfo"
                        },
                        {
                            "id": "2-3",
                            "name": "Administrators",
                            "href": "/about/administrator"
                        }
                    ]
                },
                {
                    "id": "3",
                    "name": "Personnel",
                    "href": "/personnel",
                    "subLinks": [
                        {
                            "id": "3-1",
                            "name": "Teachers",
                            "href": "/personnel/teachers"
                        },
                        {
                            "id": "3-2",
                            "name": "Committee Members",
                            "href": "/personnel/staff"
                        }
                    ]
                },
                {
                    "id": "4",
                    "name": "Exam Results",
                    "href": "/examResults",
                    "subLinks": [
                        {
                            "id": "4-1",
                            "name": "Public Examination",
                            "href": "/results/publicExam"
                        },
                        {
                            "id": "4-2",
                            "name": "Internal School Examination",
                            "href": "/results/schoolExam"
                        }
                    ]
                },
                {
                    "id": "5",
                    "name": "Notice",
                    "href": "/notice"
                },
                {
                    "id": "6",
                    "name": "Gallery",
                    "href": "/gallery",
                    "subLinks": [
                        {
                            "id": "6-1",
                            "name": "Photos",
                            "href": "/gallery/photos"
                        },
                        {
                            "id": "6-2",
                            "name": "Videos",
                            "href": "/gallery/videos"
                        }
                    ]
                },
                {
                    "id": "7",
                    "name": "Blog",
                    "href": "/blog"
                },
                {
                    "id": "8",
                    "name": "Event",
                    "href": "/event"
                },
                {
                    "id": "9",
                    "name": "Careers",
                    "href": "/career"
                },
                {
                    "id": "10",
                    "name": "Contact",
                    "href": "/contact"
                }
            ]
        }
    ]
}
```
