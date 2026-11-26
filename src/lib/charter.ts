import {
  storio,
  type StorioComplaintOfficer,
  type StorioComplaintStep,
  type StorioHotline,
  type StorioInformationService,
  type StorioMpoInfo,
} from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { byOrder, safely, withDemoFallback, withDemoRecord } from './data';
import { mediaUrl, normalizeMpoInfo } from './normalize';
import type { TenantContext } from './tenant';

/**
 * Citizen charter and compliance data (dashboard: Compliance), shown on /citizen-charter.
 */
export async function loadMpoInfo(ctx: TenantContext): Promise<StorioMpoInfo | null> {
  const real = normalizeMpoInfo(await safely(storio.getMpoInfo(ctx.tenantHost)));
  return withDemoRecord(real, DEFAULT_DEMO_DATA.mpoInfo, ctx.isStandalone);
}

export async function loadInformationService(ctx: TenantContext): Promise<StorioInformationService | null> {
  const real = await safely(storio.getInformationService(ctx.tenantHost));
  const info = real ? { ...real, photo_url: mediaUrl(real.photo_url) } : null;
  return withDemoRecord(info, DEFAULT_DEMO_DATA.informationService, ctx.isStandalone);
}

export async function loadComplaintOfficer(ctx: TenantContext): Promise<StorioComplaintOfficer | null> {
  const real = await safely(storio.getComplaintOfficer(ctx.tenantHost));
  const officer = real ? { ...real, photo_url: mediaUrl(real.photo_url) } : null;
  return withDemoRecord(officer, DEFAULT_DEMO_DATA.complaintOfficer, ctx.isStandalone);
}

/** Emergency and helpline numbers, emergency numbers first. */
export async function loadHotlines(ctx: TenantContext): Promise<StorioHotline[]> {
  const real = await safely(storio.getHotlines(ctx.tenantHost));
  const hotlines = byOrder(withDemoFallback(real, DEFAULT_DEMO_DATA.hotlines, ctx.isStandalone).filter((h) => h.is_active !== false));
  return [...hotlines].sort((a, b) => Number(!!b.is_emergency) - Number(!!a.is_emergency));
}

/** services_offered is a list, or one text with one service per line. */
export function serviceList(info: StorioInformationService): string[] {
  const value = info.services_offered;
  if (Array.isArray(value)) return value.filter(Boolean);
  return (value ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

/** complaint_process is a list of steps, or one text with one step per line. */
export function complaintSteps(officer: StorioComplaintOfficer): StorioComplaintStep[] {
  const value = officer.complaint_process;
  if (Array.isArray(value)) return [...value].sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0));
  return (value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => ({ step_number: i + 1, description: line }));
}
