'use client';

import pageDefaults from '@/content/template-0-starter-staff.json';
import { usePageText } from './usePageText';

export type StaffText = typeof pageDefaults;

/** The editable texts of the page "template-0-starter-staff" (defaults + the school's saved values). */
export function useStaffText(): StaffText {
  return usePageText('template-0-starter-staff', pageDefaults);
}
