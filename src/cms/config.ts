import { defineCms, type IconComponent } from '@brainicon/storio-elements-editor';
import { restAdapter } from '@brainicon/storio-elements-editor/adapters';
import {
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  Heart,
  Lightbulb,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from 'lucide-react';

import { cmsCollectionLimits, cmsPages, cmsStyles, type IconName } from './pages';

/**
 * ============================================================================
 * Full CMS config (browser side)
 * ============================================================================
 * Builds on the plain data in ./pages.ts and adds the parts that cannot be
 * serialized: icon components and the storage adapter.
 *
 * Import this file only from client components ('use client'). Server code
 * should import `cmsPages` from ./pages instead.
 * ============================================================================
 */

/** Every icon an editor can pick. `Record<IconName, ...>` keeps it in step with iconNames. */
export const ICONS: Record<IconName, IconComponent> = {
  Bell,
  BookOpen,
  Calendar,
  GraduationCap,
  Heart,
  Lightbulb,
  ShieldCheck,
  Star,
  Trophy,
  Users,
};

/** The Storio tenant dashboard origin that shows this site in its editor iframe. */
const dashboardOrigin = process.env.NEXT_PUBLIC_STORIO_DASHBOARD_ORIGIN;

export const cms = defineCms({
  title: 'Template editor',
  pages: cmsPages,
  icons: ICONS,
  styles: cmsStyles,
  collectionLimits: cmsCollectionLimits,
  allowedOrigins: dashboardOrigin ? [dashboardOrigin] : [],
  // The browser reads published content through this template's own API route,
  // which forwards to the right store (local file or the tenant's Storio backend).
  adapter: restAdapter({ baseUrl: '/api/cms' }),
});
