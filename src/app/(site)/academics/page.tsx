import type { Metadata } from 'next';

import { AcademicsView } from '@/components/views/AcademicsView';
import { loadAcademicPrograms, loadClassRoutines, loadStudentStats, loadSyllabuses } from '@/lib/academics';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-academics');
}

export default async function AcademicsPage() {
  const ctx = await resolveTenant();
  const [programs, routines, syllabuses, stats] = await Promise.all([
    loadAcademicPrograms(ctx),
    loadClassRoutines(ctx),
    loadSyllabuses(ctx),
    loadStudentStats(ctx),
  ]);
  return <AcademicsView programs={programs} routines={routines} syllabuses={syllabuses} stats={stats} />;
}
