import {
  storio,
  type StorioAcademicProgram,
  type StorioClassRoutine,
  type StorioClassRoutineDaySchedule,
  type StorioStudentStatsResponse,
  type StorioSyllabus,
} from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback, withDemoRecord } from './data';
import type { TenantContext } from './tenant';

/** Programs (primary, secondary...) and their classes. */
export async function loadAcademicPrograms(ctx: TenantContext): Promise<StorioAcademicProgram[]> {
  const real = await safely(storio.getAcademicPrograms(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.academicPrograms, ctx.isStandalone);
}

/** Active class routines (timetables). */
export async function loadClassRoutines(ctx: TenantContext): Promise<StorioClassRoutine[]> {
  const real = await safely(storio.getClassRoutines(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.classRoutines, ctx.isStandalone).filter((r) => r.is_active !== false);
}

/** Syllabus files per class and exam. */
export async function loadSyllabuses(ctx: TenantContext): Promise<StorioSyllabus[]> {
  const real = await safely(storio.getSyllabuses(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.syllabuses, ctx.isStandalone).filter((s) => s.is_active !== false);
}

/**
 * Student numbers per class. getStudentStats takes optional filters:
 * storio.getStudentStats({ year: 2026, program: 'Secondary' }, tenantHost).
 */
export async function loadStudentStats(ctx: TenantContext): Promise<StorioStudentStatsResponse | null> {
  const real = await safely(storio.getStudentStats({}, ctx.tenantHost));
  const usable = real && Array.isArray(real.classes) && real.classes.length > 0 ? real : null;
  return withDemoRecord(usable, DEFAULT_DEMO_DATA.studentStats, ctx.isStandalone);
}

/**
 * A routine's schedule is either a list of days or a loose object from older data.
 * Returns the days only when the schedule is a list; otherwise the page offers the routine file.
 */
export function routineDays(routine: StorioClassRoutine): StorioClassRoutineDaySchedule[] {
  if (!Array.isArray(routine.schedule)) return [];
  return routine.schedule.filter((d): d is StorioClassRoutineDaySchedule => !!d && typeof d.day === 'string');
}
