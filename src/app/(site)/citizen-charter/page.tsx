import type { Metadata } from 'next';

import { CitizenCharterView } from '@/components/views/CitizenCharterView';
import { complaintSteps, loadComplaintOfficer, loadHotlines, loadInformationService, loadMpoInfo, serviceList } from '@/lib/charter';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-10-starter-citizen-charter');
}

export default async function CitizenCharterPage() {
  const ctx = await resolveTenant();
  const [mpo, info, officer, hotlines] = await Promise.all([
    loadMpoInfo(ctx),
    loadInformationService(ctx),
    loadComplaintOfficer(ctx),
    loadHotlines(ctx),
  ]);

  return (
    <CitizenCharterView
      mpo={mpo}
      info={info}
      services={info ? serviceList(info) : []}
      officer={officer}
      steps={officer ? complaintSteps(officer) : []}
      hotlines={hotlines}
    />
  );
}
