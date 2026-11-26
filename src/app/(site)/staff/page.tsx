import type { Metadata } from 'next';

import { StaffView } from '@/components/views/StaffView';
import { groupBy, loadStaff } from '@/lib/people';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-staff');
}

export default async function StaffPage() {
  const staff = await loadStaff(await resolveTenant());
  return <StaffView departments={groupBy(staff, (m) => m.department, '')} />;
}
