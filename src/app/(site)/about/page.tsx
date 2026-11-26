import type { Metadata } from 'next';

import { AboutView } from '@/components/views/AboutView';
import { loadInstitutionProfile } from '@/lib/institution';
import { groupBy, loadLeadershipMessages, loadTeam } from '@/lib/people';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-about');
}

export default async function AboutPage() {
  const ctx = await resolveTenant();
  const [profile, leadership, team] = await Promise.all([loadInstitutionProfile(ctx), loadLeadershipMessages(ctx), loadTeam(ctx)]);

  return <AboutView profile={profile} leadership={leadership} teamGroups={groupBy(team, (m) => m.section_name, '')} />;
}
