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
  "events"
]
```

**Why is this important?** 
If your template doesn't have a "Careers" page built into it, you shouldn't confuse the admin by showing them a "Careers Manager" in their CMS dashboard. By omitting `"careers"` from this features array, the Storio backend will safely and automatically hide that entire module from the admin panel.

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
        "events"
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
