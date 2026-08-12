import { StorioNotice, StorioHeroSlide, StorioSettingsResponse } from '@storio/template-sdk';

/**
 * DEFAULT_DEMO_DATA
 * 
 * Local fallback mock data used ONLY when running in Standalone Preview mode (e.g., localhost:3000)
 * and the SDK returns null or empty data.
 * 
 * RULE 1 REMINDER:
 * - Standalone Preview (localhost): Fallback to DEFAULT_DEMO_DATA if SDK data is empty.
 * - Live Tenant Domain (school.com): NEVER show DEFAULT_DEMO_DATA. Display empty state if DB has 0 items.
 */
export const DEFAULT_DEMO_DATA: {
  settings: StorioSettingsResponse;
  notices: StorioNotice[];
  heroSlides: StorioHeroSlide[];
} = {
  settings: {
    site_title: "Storio Model Academy",
    site_tagline: "Empowering Future Leaders through Excellence",
    contact_email: "info@storiomodel.edu",
    phone_number: "+1 (555) 019-2834",
    mailing_address: "123 Education Boulevard, Knowledge City",
  },
  notices: [
    {
      id: 1,
      title: "Annual Sports Day 2026 Registration Open",
      slug: "annual-sports-day-2026",
      content: "All students from grades 5-12 are invited to register for track and field events before Friday.",
      published_date: "2026-08-10",
      is_urgent: true,
    },
    {
      id: 2,
      title: "Parent-Teacher Conference Schedule",
      slug: "ptc-schedule-q3",
      content: "The Q3 Parent-Teacher Conference will be held online via video call on August 20.",
      published_date: "2026-08-05",
      is_urgent: false,
    },
    {
      id: 3,
      title: "Science Fair Project Submission Deadline",
      slug: "science-fair-deadline",
      content: "Final project submissions and project boards must be turned in to the lab supervisor.",
      published_date: "2026-08-01",
      is_urgent: false,
    },
  ],
  heroSlides: [
    {
      id: 1,
      title: "Welcome to Storio Model Academy",
      subtitle: "Admissions Open for Academic Session 2026-2027",
      button_text: "Apply Now",
      button_url: "/admission",
    },
  ],
};
