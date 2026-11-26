import type {
  StorioAlbum,
  StorioActivityItem,
  StorioBlogPost,
  StorioEvent,
  StorioFaq,
  StorioGalleryItem,
  StorioHeroSlide,
  StorioImportantLink,
  StorioInstitutionProfile,
  StorioNotice,
  StorioPromotion,
  StorioSettingsResponse,
  StorioStaffMember,
  StorioTeamMember,
  StorioVideoItem,
} from '@storio/template-sdk';

import type { LeadershipMessage, Testimonial } from '@/lib/types';

/**
 * DEFAULT_DEMO_DATA
 *
 * Local fallback mock data used ONLY when running in Standalone Preview mode (e.g., localhost:3000)
 * and the SDK returns null or empty data. One entry per SDK method the template uses.
 *
 * RULE 1 REMINDER:
 * - Standalone Preview (localhost): Fallback to DEFAULT_DEMO_DATA if SDK data is empty.
 * - Live Tenant Domain (school.com): NEVER show DEFAULT_DEMO_DATA. Display empty state if DB has 0 items.
 * Always go through withDemoFallback / withDemoRecord (src/lib/data.ts), never read this directly in a page.
 */

const photo = (n: number) => `/images/demo/photo-${n}.svg`;
const AVATAR = '/images/demo/avatar.svg';

export const DEFAULT_DEMO_DATA: {
  settings: StorioSettingsResponse;
  notices: StorioNotice[];
  heroSlides: StorioHeroSlide[];
  promotions: StorioPromotion[];
  testimonials: Testimonial[];
  importantLinks: StorioImportantLink[];
  institutionProfile: StorioInstitutionProfile;
  leadershipMessages: LeadershipMessage[];
  team: StorioTeamMember[];
  staff: StorioStaffMember[];
  blogs: StorioBlogPost[];
  events: StorioEvent[];
  activities: StorioActivityItem[];
  gallery: StorioGalleryItem[];
  albums: StorioAlbum[];
  videos: StorioVideoItem[];
  faqs: StorioFaq[];
} = {
  settings: {
    site_title: 'Storio Model Academy',
    site_tagline: 'Empowering Future Leaders through Excellence',
    contact_email: 'info@storiomodel.edu',
    phone_number: '+1 (555) 019-2834',
    mailing_address: '123 Education Boulevard, Knowledge City',
    social_links: [
      { platform: 'facebook', url: 'https://facebook.com' },
      { platform: 'youtube', url: 'https://youtube.com' },
    ],
  },

  notices: [
    {
      id: 1,
      title: 'Annual Sports Day 2026 Registration Open',
      slug: 'annual-sports-day-2026',
      content: 'All students from grades 5-12 are invited to register for track and field events before Friday.',
      published_date: '2026-08-10',
      is_urgent: true,
    },
    {
      id: 2,
      title: 'Parent-Teacher Conference Schedule',
      slug: 'ptc-schedule-q3',
      content: 'The Q3 Parent-Teacher Conference will be held online via video call on August 20.',
      published_date: '2026-08-05',
      is_urgent: false,
    },
    {
      id: 3,
      title: 'Science Fair Project Submission Deadline',
      slug: 'science-fair-deadline',
      content: 'Final project submissions and project boards must be turned in to the lab supervisor.',
      published_date: '2026-08-01',
      is_urgent: false,
    },
  ],

  heroSlides: [
    { id: 1, title: 'Admissions open for 2026-2027', subtitle: 'Apply online in ten minutes.', image_url: photo(1), button_text: 'Apply now', button_url: '/admission', order: 1 },
    { id: 2, title: 'New science labs', subtitle: 'Hands-on learning from grade 5.', image_url: photo(3), button_text: 'Our academics', button_url: '/academics', order: 2 },
    { id: 3, title: 'Champions again', subtitle: 'Our football team won the city cup.', image_url: photo(2), button_text: 'Activities', button_url: '/activities', order: 3 },
  ],

  promotions: [
    {
      id: 1,
      title: 'Early bird admission',
      description: 'Apply before March 31 and pay no registration fee.',
      badge_text: 'New',
      cta_label: 'Apply now',
      cta_url: '/admission',
    },
  ],

  testimonials: [
    { id: 1, author_name: 'Nusrat Jahan', author_title: 'Parent, grade 10', rating: 5, content: 'The teachers know my son by name and care about his progress.', avatar_url: AVATAR, order: 1 },
    { id: 2, author_name: 'Rafiq Ahmed', author_title: 'Alumnus, class of 2019', rating: 5, content: 'The debate club gave me the confidence I use every day at university.', avatar_url: AVATAR, order: 2 },
    { id: 3, author_name: 'Maria Lopez', author_title: 'Parent, grade 4', rating: 4, content: 'A safe, friendly school with excellent communication.', avatar_url: AVATAR, order: 3 },
  ],

  importantLinks: [
    { id: 1, title: 'Ministry of Education', url: 'https://moedu.gov.bd', order: 1 },
    { id: 2, title: 'Education Board', url: 'https://educationboard.gov.bd', order: 2 },
    { id: 3, title: 'National Curriculum', url: 'https://nctb.gov.bd', order: 3 },
  ],

  institutionProfile: {
    id: 1,
    institution_image_url: photo(4),
    eiin: '108251',
    school_code: '1234',
    school_shift: 'Morning and day',
    school_type: 'Secondary school',
    division: 'Dhaka',
    district: 'Dhaka',
    education_board: 'Dhaka Board',
    total_students: 1250,
    total_teachers: 64,
    mission: 'To give every student a strong education and the character to use it well.',
    vision: 'A community of curious, kind and capable learners.',
  },

  leadershipMessages: [
    {
      id: 1,
      title: 'Message from the Principal',
      author_name: 'Prof. Arthur Pendleton',
      author_role: 'Principal',
      content: '<p>Welcome to Storio Model Academy. Our teachers work every day so that each student leaves us ready for life.</p><p>We look forward to meeting you.</p>',
      photo_url: AVATAR,
      order: 1,
    },
  ],

  team: [
    { id: 1, fullname: 'Dr. Salma Khan', designation: 'Chairperson', section_name: 'Governing body', image_data: { file_url: AVATAR }, order: 1 },
    { id: 2, fullname: 'Mahbub Hasan', designation: 'Member', section_name: 'Governing body', image_data: { file_url: AVATAR }, order: 2 },
    { id: 3, fullname: 'Ayesha Rahman', designation: 'Guardian representative', section_name: 'Governing body', image_data: { file_url: AVATAR }, order: 3 },
  ],

  staff: [
    { id: 1, name: 'Karim Uddin', designation: 'Head of Science', department: 'Science', photo_url: AVATAR, email: 'karim@storiomodel.edu' },
    { id: 2, name: 'Farzana Akter', designation: 'Senior Teacher, Physics', department: 'Science', photo_url: AVATAR },
    { id: 3, name: 'John Carter', designation: 'English Teacher', department: 'Languages', photo_url: AVATAR },
    { id: 4, name: 'Shirin Sultana', designation: 'Bangla Teacher', department: 'Languages', photo_url: AVATAR },
    { id: 5, name: 'Tanvir Hossain', designation: 'Office Manager', department: 'Administration', photo_url: AVATAR },
  ],

  blogs: [
    {
      id: 1,
      title: 'How our students built a weather station',
      slug: 'student-weather-station',
      summary: 'Grade 8 students designed, built and coded a working weather station on the school roof.',
      content: '<p>Over six weeks, grade 8 students designed, built and coded a working weather station.</p><p>The data now appears live in the science lab.</p>',
      featured_image_url: photo(3),
      category_name: 'Science',
      published_at: '2026-08-12',
    },
    {
      id: 2,
      title: 'Five tips for exam season',
      slug: 'exam-season-tips',
      summary: 'Our counsellors share simple habits that help students stay calm and prepared.',
      content: '<p>Sleep well, plan your week, and take short breaks. Our counsellors explain why these habits work.</p>',
      featured_image_url: photo(6),
      category_name: 'Student life',
      published_at: '2026-07-28',
    },
  ],

  events: [
    {
      id: 1,
      title: 'Annual Science Fair',
      slug: 'annual-science-fair',
      excerpt: 'Students present their projects to parents and guest judges.',
      content: '<p>More than 80 projects, from robots to recycling. Everyone is welcome.</p>',
      location: 'Main hall',
      start_date: '2026-12-05T09:00:00',
      end_date: '2026-12-05T15:00:00',
      is_featured: true,
      featured_image: photo(5),
    },
    {
      id: 2,
      title: 'Winter Sports Day',
      slug: 'winter-sports-day',
      excerpt: 'Track and field events for all grades.',
      content: '<p>Races, relays and a tug of war. Parents are invited to cheer.</p>',
      location: 'School field',
      start_date: '2027-01-15T08:00:00',
      featured_image: photo(2),
    },
  ],

  activities: [
    {
      id: 1,
      title: 'Robotics club',
      slug: 'robotics-club',
      summary: 'Students build and program robots every Thursday after school.',
      content: '<p>The robotics club meets every Thursday. Members take part in national competitions.</p>',
      featured_image_url: photo(4),
      date: '2026-06-01',
    },
    {
      id: 2,
      title: 'Debate society',
      slug: 'debate-society',
      summary: 'Weekly debates in English and Bangla.',
      content: '<p>The debate society trains students in public speaking and critical thinking.</p>',
      featured_image_url: photo(1),
      date: '2026-05-10',
    },
  ],

  gallery: [1, 2, 3, 4, 5, 6].map((n) => ({ id: n, title: `Campus photo ${n}`, image_url: photo(n), caption: 'Life at Storio Model Academy' })),

  albums: [
    { id: 1, title: 'Sports Day 2026', cover_image_url: photo(2), images: [2, 5].map((n) => ({ id: n, image_url: photo(n) })) },
    { id: 2, title: 'Science Fair 2026', cover_image_url: photo(3), images: [3, 4].map((n) => ({ id: n, image_url: photo(n) })) },
  ],

  videos: [
    { id: 1, title: 'A day at our school', description: 'Two minutes of school life.', platform: 'youtube', url: 'https://www.youtube.com', thumbnail_url: photo(6), is_featured: true },
    { id: 2, title: 'Science fair highlights', platform: 'youtube', url: 'https://www.youtube.com', thumbnail_url: photo(3) },
  ],

  faqs: [
    { id: 1, question: 'When do admissions open?', answer: 'Admissions open every year in January.' },
    { id: 2, question: 'Do you offer transport?', answer: 'Yes, school buses cover most of the city.' },
    { id: 3, question: 'What are the school hours?', answer: 'Morning shift 7:30 to 12:30, day shift 12:45 to 5:30.' },
  ],
};
