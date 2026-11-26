import { storio, type StorioStaffMember, type StorioTeamMember } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { byOrder, safely, withDemoFallback } from './data';
import { normalizeStaff, normalizeTeam } from './normalize';
import type { TenantContext } from './tenant';
import { narrowList, toLeadershipMessage, type LeadershipMessage } from './types';

/** Teachers and staff (dashboard: Staff). */
export async function loadStaff(ctx: TenantContext): Promise<StorioStaffMember[]> {
  const real = normalizeStaff(await safely(storio.getStaff(ctx.tenantHost)));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.staff, ctx.isStandalone);
}

/** Governing body and committees (dashboard: Team). Hidden members are left out. */
export async function loadTeam(ctx: TenantContext): Promise<StorioTeamMember[]> {
  const real = normalizeTeam(await safely(storio.getTeam(ctx.tenantHost)));
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.team, ctx.isStandalone).filter((m) => m.is_visible !== false));
}

/** Messages from the principal, chairman... Loose records narrowed with toLeadershipMessage (Rule 2). */
export async function loadLeadershipMessages(ctx: TenantContext): Promise<LeadershipMessage[]> {
  const real = narrowList(await safely(storio.getLeadershipMessages(ctx.tenantHost)), toLeadershipMessage);
  return byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.leadershipMessages, ctx.isStandalone));
}

/** Groups records by a label (staff by department, team by section), keeping first-seen order. */
export function groupBy<T>(items: T[], label: (item: T) => string | undefined, fallback: string): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = label(item) || fallback;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()];
}
