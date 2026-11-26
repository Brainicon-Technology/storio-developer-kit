import type {
  StorioAlbum,
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
  StorioAcademicProgram,
  StorioBoardNotice,
  StorioCalendarEvent,
  StorioClassRoutine,
  StorioCustomPage,
  StorioExamResult,
  StorioStudentStatsResponse,
  StorioSyllabus,
  StorioAdmissionFormConfig,
  StorioComplaintOfficer,
  StorioHotline,
  StorioInformationService,
  StorioMpoInfo,
  StorioNavigationItem,
  StorioCareer,
  StorioLeadershipMessage,
  StorioTestimonial,
  StorioActivityCategory,
  StorioBlogCategory,
  StorioCalendarSetting,
  StorioEventCategory,
  StorioForm,
  StorioInstitutionCard,
} from '@storio/template-sdk';

import type { ActivityItem } from '@/lib/normalize';

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
  testimonials: StorioTestimonial[];
  importantLinks: StorioImportantLink[];
  institutionProfile: StorioInstitutionProfile;
  leadershipMessages: StorioLeadershipMessage[];
  team: StorioTeamMember[];
  staff: StorioStaffMember[];
  blogs: StorioBlogPost[];
  events: StorioEvent[];
  activities: ActivityItem[];
  gallery: StorioGalleryItem[];
  albums: StorioAlbum[];
  videos: StorioVideoItem[];
  faqs: StorioFaq[];
  academicPrograms: StorioAcademicProgram[];
  classRoutines: StorioClassRoutine[];
  syllabuses: StorioSyllabus[];
  studentStats: StorioStudentStatsResponse;
  examResults: StorioExamResult[];
  calendarEvents: StorioCalendarEvent[];
  jobs: StorioCareer[];
  boardNotices: StorioBoardNotice[];
  customPages: StorioCustomPage[];
  navigation: StorioNavigationItem[];
  admissionFormConfig: StorioAdmissionFormConfig;
  mpoInfo: StorioMpoInfo;
  informationService: StorioInformationService;
  complaintOfficer: StorioComplaintOfficer;
  hotlines: StorioHotline[];
  institutionCards: StorioInstitutionCard[];
  blogCategories: StorioBlogCategory[];
  activityCategories: StorioActivityCategory[];
  eventCategories: StorioEventCategory[];
  calendarSettings: StorioCalendarSetting;
  forms: StorioForm[];
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
    { id: 1, name: 'Nusrat Jahan', designation: 'Parent, grade 10', rating: 5, message: 'The teachers know my son by name and care about his progress.', photo_data: { id: 1, file_url: AVATAR }, status: 'active', order: 1 },
    { id: 2, name: 'Rafiq Ahmed', designation: 'Alumnus', organization: 'Class of 2019', rating: 5, message: 'The debate club gave me the confidence I use every day at university.', photo_data: { id: 2, file_url: AVATAR }, status: 'active', order: 2 },
    { id: 3, name: 'Maria Lopez', designation: 'Parent, grade 4', rating: 4, message: 'A safe, friendly school with excellent communication.', photo_data: { id: 3, file_url: AVATAR }, status: 'active', order: 3 },
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
      section_title: 'Message from the Principal',
      name: 'Prof. Arthur Pendleton',
      role: 'Principal',
      company: 'Storio Model Academy',
      message: 'Welcome to Storio Model Academy. Our teachers work every day so that each student leaves us ready for life.\n\nWe look forward to meeting you.',
      image_data: { id: 1, file_url: AVATAR },
      status: 'published',
      display_order: 1,
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
      categories_detail: [{ id: 1, name: 'Academic', slug: 'academic' }],
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
      categories_detail: [{ id: 2, name: 'Sports', slug: 'sports' }],
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
      category_name: 'Clubs',
    },
    {
      id: 2,
      title: 'Debate society',
      slug: 'debate-society',
      summary: 'Weekly debates in English and Bangla.',
      content: '<p>The debate society trains students in public speaking and critical thinking.</p>',
      featured_image_url: photo(1),
      date: '2026-05-10',
      category_name: 'Clubs',
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

  academicPrograms: [
    { id: 1, name: 'Primary', classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], is_custom: false },
    { id: 2, name: 'Secondary', classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'], is_custom: false },
    { id: 3, name: 'Higher secondary', classes: ['Class 11', 'Class 12'], is_custom: false },
  ],

  classRoutines: [
    {
      id: 1,
      class_name: 'Class 9',
      section: 'A',
      shift: 'Morning',
      academic_year: 2026,
      schedule: [
        {
          day: 'Sunday',
          periods: [
            { period: 1, subject: 'Mathematics', teacher: 'Karim Uddin', start_time: '07:30', end_time: '08:15' },
            { period: 2, subject: 'English', teacher: 'John Carter', start_time: '08:15', end_time: '09:00' },
            { period: 3, subject: 'Physics', teacher: 'Farzana Akter', start_time: '09:15', end_time: '10:00' },
          ],
        },
        {
          day: 'Monday',
          periods: [
            { period: 1, subject: 'Bangla', teacher: 'Shirin Sultana', start_time: '07:30', end_time: '08:15' },
            { period: 2, subject: 'Chemistry', teacher: 'Karim Uddin', start_time: '08:15', end_time: '09:00' },
            { period: 3, subject: 'ICT', teacher: 'Tanvir Hossain', start_time: '09:15', end_time: '10:00' },
          ],
        },
      ],
    },
  ],

  syllabuses: [
    { id: 1, title: 'Class 9 annual syllabus', class_name: 'Class 9', exam_type: 'Annual', academic_year: 2026, file_url: '#', file_size: '420 KB' },
    { id: 2, title: 'Class 10 half-yearly syllabus', class_name: 'Class 10', exam_type: 'Half-yearly', academic_year: 2026, file_url: '#', file_size: '380 KB' },
  ],

  studentStats: {
    academic_year: 2026,
    grand_total_male: 640,
    grand_total_female: 610,
    grand_total: 1250,
    total_sections: 30,
    classes: [
      { id: 1, academic_year: 2026, class_name: 'Class 6', total_male: 70, total_female: 66, total_students: 136 },
      { id: 2, academic_year: 2026, class_name: 'Class 7', total_male: 68, total_female: 64, total_students: 132 },
      { id: 3, academic_year: 2026, class_name: 'Class 8', total_male: 65, total_female: 63, total_students: 128 },
      { id: 4, academic_year: 2026, class_name: 'Class 9', total_male: 62, total_female: 60, total_students: 122 },
      { id: 5, academic_year: 2026, class_name: 'Class 10', total_male: 60, total_female: 58, total_students: 118 },
    ],
  },

  examResults: [
    { id: 1, exam_name: 'SSC', class_name: 'Class 10', year: 2025, total_examinees: 118, passed: 115, failed: 3, pass_rate: 97.5, exam_type: 'Public', file_url: '#' },
    { id: 2, exam_name: 'JSC', class_name: 'Class 8', year: 2025, total_examinees: 128, passed: 126, failed: 2, pass_rate: 98.4, exam_type: 'Public' },
    { id: 3, exam_name: 'Annual exam', class_name: 'Class 9', year: 2025, total_examinees: 122, passed: 117, failed: 5, pass_rate: 95.9, exam_type: 'Internal' },
  ],

  calendarEvents: [
    { id: 1, title: 'New session begins', start_date: '2027-01-01', category: 'Academic', is_all_day: true },
    { id: 2, title: 'Half-yearly exams', start_date: '2027-06-10', end_date: '2027-06-24', category: 'Exam', is_all_day: true },
    { id: 3, title: 'Eid holidays', start_date: '2027-03-08', end_date: '2027-03-14', category: 'Holiday', is_all_day: true },
  ],

  jobs: [
    {
      id: 1,
      title: 'Senior Mathematics Teacher',
      slug: 'senior-mathematics-teacher',
      company_name: 'Storio Model Academy',
      location: 'Main campus',
      job_type: 'full_time',
      vacancy: 2,
      deadline: '2027-01-31',
      status: 'active',
      description: '<p>We are looking for an experienced mathematics teacher for classes 9 and 10.</p><ul><li>Five years of teaching experience</li><li>A degree in mathematics</li></ul>',
      application_link: 'mailto:jobs@storiomodel.edu',
      attachments_data: [{ id: 1, type: 'document', file_name: 'job-circular.pdf', url: '#' }],
    },
    {
      id: 2,
      title: 'Librarian',
      slug: 'librarian',
      company_name: 'Storio Model Academy',
      location: 'Main campus',
      job_type: 'part_time',
      vacancy: 1,
      deadline: '2027-02-15',
      status: 'active',
      description: '<p>Run our library and reading programme.</p>',
    },
  ],

  boardNotices: [
    { id: 1, title: 'SSC exam 2027 form fill-up schedule', publish_date: '2026-11-20', board: 'Dhaka Board', url: 'https://dhakaeducationboard.gov.bd' },
    { id: 2, title: 'Updated academic calendar for secondary schools', publish_date: '2026-11-02', board: 'Dhaka Board', url: 'https://dhakaeducationboard.gov.bd' },
  ],

  customPages: [
    {
      id: 1,
      title: 'Our history',
      slug: 'history',
      content: '<p>Storio Model Academy opened in 1998 with 80 students and 6 teachers.</p><h2>Milestones</h2><ul><li>2005: new science building</li><li>2015: higher secondary section</li></ul>',
      meta_title: 'Our history',
      meta_description: 'How Storio Model Academy grew since 1998.',
    },
    {
      id: 2,
      title: 'Campus safety',
      slug: 'campus-safety',
      // A page built with the dashboard's page builder: a list of typed blocks (see CustomPageBlocks).
      content: [
        { id: 'b1', type: 'Hero', content: { url: photo(3), overlayText: 'A safe campus for every student' } },
        { id: 'b2', type: 'RichText', title: 'Our approach', content: '<p>Every visitor signs in at the gate, and teachers supervise every break.</p>' },
        { id: 'b3', type: 'FeatureGrid', content: [{ title: 'CCTV', description: 'Cameras at every entrance.' }, { title: 'First aid', description: 'A nurse on duty all day.' }, { title: 'Drills', description: 'Fire drills every term.' }] },
        { id: 'b4', type: 'CustomTable', title: 'Gate hours', content: { headers: ['Day', 'Open', 'Close'], rows: [['Sunday to Thursday', '7:30', '16:00'], ['Saturday', '8:00', '13:00']] } },
        { id: 'b5', type: 'Form', title: 'Report a concern', content: { formCode: 'demo-visit-request', form_data: null } },
      ],
      meta_description: 'How we keep our campus safe.',
    },
  ],

  navigation: [
    { id: 1, label: 'Online admission', url: '/admission' },
    { id: 2, label: 'Exam results', url: '/results' },
    { id: 3, label: 'Citizen charter', url: '/citizen-charter' },
    { id: 4, label: 'Careers', url: '/careers' },
  ],

  admissionFormConfig: {
    id: 1,
    is_active: true,
    fields: [
      { id: 'student_name', label: 'Student name', type: 'text', required: true, order: 1 },
      { id: 'date_of_birth', label: 'Date of birth', type: 'date', required: true, order: 2 },
      { id: 'class_applying', label: 'Class applying for', type: 'select', required: true, order: 3, options: ['Class 1', 'Class 6', 'Class 9', 'Class 11'] },
      { id: 'gender', label: 'Gender', type: 'radio', required: true, order: 4, options: ['Female', 'Male'] },
      { id: 'guardian_name', label: 'Guardian name', type: 'text', required: true, order: 5 },
      { id: 'previous_school', label: 'Previous school', type: 'text', order: 6 },
      { id: 'address', label: 'Address', type: 'textarea', order: 7 },
      { id: 'transport', label: 'Needs school transport', type: 'checkbox', order: 8 },
    ],
  },

  mpoInfo: {
    id: 1,
    is_mpo_enlisted: true,
    mpo_status: 'Enlisted',
    mpo_code: '2601081234',
    mpo_date: '2004-07-01',
    mpo_order_number: 'MPO/2004/118',
    description: 'Teachers on the government MPO list receive part of their salary from the government.',
    total_mpo_teachers: 42,
    total_non_mpo_teachers: 22,
    documents: [{ title: 'MPO approval letter', file_url: '#', issue_date: '2004-07-01' }],
  },

  informationService: {
    id: 1,
    title: 'Information desk',
    responsible_person: 'Tanvir Hossain',
    designation: 'Office Manager',
    phone: '+1 (555) 019-2835',
    email: 'info-desk@storiomodel.edu',
    office_hours: 'Sunday to Thursday, 9:00 to 16:00',
    description: 'Ask for any public information about the school under the Right to Information Act.',
    services_offered: ['Admission information', 'Certificates and transcripts', 'Fee information'],
    photo_url: '/images/demo/avatar.svg',
  },

  complaintOfficer: {
    id: 1,
    name: 'Dr. Salma Khan',
    designation: 'Complaint officer',
    phone: '+1 (555) 019-2836',
    email: 'complaints@storiomodel.edu',
    office_hours: 'Sunday and Wednesday, 10:00 to 13:00',
    description: 'Parents and students can raise any complaint in confidence.',
    complaint_process: [
      { step_number: 1, title: 'Submit', description: 'Write to the complaint officer or visit during office hours.' },
      { step_number: 2, title: 'Review', description: 'The complaint is reviewed within seven working days.' },
      { step_number: 3, title: 'Answer', description: 'You receive a written answer with the decision.' },
    ],
    photo_url: '/images/demo/avatar.svg',
  },

  hotlines: [
    { id: 1, title: 'National emergency', number: '999', category: 'Emergency', is_emergency: true, order: 1 },
    { id: 2, title: 'Fire service', number: '102', category: 'Emergency', is_emergency: true, order: 2 },
    { id: 3, title: 'School office', number: '+1 (555) 019-2834', category: 'School', order: 3 },
    { id: 4, title: 'Child helpline', number: '1098', category: 'Support', order: 4 },
  ],

  institutionCards: [
    { id: 1, title: 'Science labs', description: 'Physics, chemistry and biology labs for every class.', icon: 'science', order: 1 },
    { id: 2, title: 'Library', description: 'Over 10,000 books and a quiet reading room.', icon: 'menu_book', order: 2 },
    { id: 3, title: 'Sports', description: 'A full-size field and indoor games.', icon: 'sports_soccer', order: 3 },
  ],

  blogCategories: [
    { id: 1, name: 'Science', slug: 'science', posts_count: 1 },
    { id: 2, name: 'Student life', slug: 'student-life', posts_count: 1 },
  ],

  activityCategories: [{ id: 1, name: 'Clubs', slug: 'clubs', activities_count: 2 }],

  eventCategories: [
    { id: 1, name: 'Academic', slug: 'academic', events_count: 1 },
    { id: 2, name: 'Sports', slug: 'sports', events_count: 1 },
  ],

  // Days of the week the school is closed, as JavaScript day numbers (0 = Sunday ... 6 = Saturday).
  calendarSettings: { weekend_days: '5,6' },

  forms: [
    {
      code: 'demo-visit-request',
      title: 'Request a campus visit',
      description: 'Tell us when you would like to visit, and we will confirm by email.',
      status: 'active',
      settings: { successMessage: 'Thank you! We will email you to confirm your visit.' },
      elements: [
        { id: 'name', type: 'text', label: 'Your name', required: true },
        { id: 'email', type: 'email', label: 'Email address', required: true },
        { id: 'phone', type: 'phone', label: 'Phone number' },
        { id: 'date', type: 'date', label: 'Preferred date', required: true },
        { id: 'grade', type: 'select', label: 'Grade of interest', options: [{ label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }] },
        { id: 'notes', type: 'textarea', label: 'Anything we should know?', helpText: 'Optional.' },
        { id: 'document', type: 'file', label: 'Attach a document', acceptedTypes: ['.pdf', '.jpg', '.png'] },
      ],
    },
  ],
};
