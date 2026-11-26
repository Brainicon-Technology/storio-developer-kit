/**
 * ============================================================================
 * Types for the SDK methods that return loose data
 * ============================================================================
 * getTestimonials, getLeadershipMessages, getCareers and getJobDetail return
 * `Record<string, unknown>` in the SDK. Rule 2 forbids `any`, so this file
 * describes their documented shape (docs/Storio_SDK_V2_Endpoints_and_Methods_Guide.md)
 * and narrows each record with a type guard. Records without the required
 * fields are dropped instead of crashing the page.
 * ============================================================================
 */

import { mediaUrl, textToHtml } from './normalize';

export interface Testimonial {
  id: number;
  author_name: string;
  author_title?: string;
  rating?: number;
  content: string;
  avatar_url?: string;
  order?: number;
}

export interface LeadershipMessage {
  id: number;
  title?: string;
  author_name: string;
  author_role?: string;
  /** HTML. Render it with <RichText>. */
  content: string;
  photo_url?: string;
  signature_url?: string;
  order?: number;
}

export interface JobAttachment {
  id?: number;
  file_name?: string;
  url: string;
}

export interface Job {
  id: number;
  title: string;
  slug: string;
  company_name?: string;
  location?: string;
  job_type?: string;
  vacancy?: number;
  deadline?: string;
  status?: string;
  /** HTML (detail only). Render it with <RichText>. */
  description?: string;
  application_link?: string;
  attachments_data?: JobAttachment[];
}


type Loose = Record<string, unknown>;

const str = (r: Loose, key: string): string | undefined => (typeof r[key] === 'string' ? (r[key] as string) : undefined);
const num = (r: Loose, key: string): number | undefined => (typeof r[key] === 'number' ? (r[key] as number) : undefined);

/** The documented name first, then the name the live backend sends. */
const first = (r: Loose, keys: string[]) => keys.map((k) => str(r, k)).find(Boolean);
const isHidden = (r: Loose) => r.status !== undefined && !['active', 'published'].includes(String(r.status));

export function toTestimonial(r: Loose): Testimonial | null {
  const id = num(r, 'id');
  const author_name = first(r, ['author_name', 'name']);
  const content = first(r, ['content', 'message']);
  if (id === undefined || !author_name || !content || isHidden(r)) return null;
  const title = str(r, 'author_title') ?? [str(r, 'designation'), str(r, 'organization')].filter(Boolean).join(', ');
  return {
    id,
    author_name,
    content,
    author_title: title || undefined,
    rating: num(r, 'rating'),
    avatar_url: mediaUrl(r.avatar_url) ?? mediaUrl(r.photo_data),
    order: num(r, 'order'),
  };
}

export function toLeadershipMessage(r: Loose): LeadershipMessage | null {
  const id = num(r, 'id');
  const author_name = first(r, ['author_name', 'name']);
  const content = first(r, ['content', 'message']);
  if (id === undefined || !author_name || !content || isHidden(r)) return null;
  const role = str(r, 'author_role') ?? [str(r, 'role'), str(r, 'company')].filter(Boolean).join(', ');
  return {
    id,
    author_name,
    // The backend may send plain text with line breaks: turned into simple HTML for <RichText>.
    content: textToHtml(content),
    title: first(r, ['title', 'section_title']),
    author_role: role || undefined,
    photo_url: mediaUrl(r.photo_url) ?? mediaUrl(r.image_data),
    signature_url: mediaUrl(r.signature_url) ?? mediaUrl(r.signature_data),
    order: num(r, 'order') ?? num(r, 'display_order'),
  };
}

export function toJob(r: Loose): Job | null {
  const id = num(r, 'id');
  const title = str(r, 'title');
  const slug = str(r, 'slug');
  if (id === undefined || !title || !slug) return null;
  const attachments = Array.isArray(r.attachments_data) ? (r.attachments_data as unknown[]) : [];
  return {
    id,
    title,
    slug,
    company_name: str(r, 'company_name'),
    location: str(r, 'location'),
    job_type: str(r, 'job_type'),
    vacancy: num(r, 'vacancy'),
    deadline: str(r, 'deadline'),
    status: str(r, 'status'),
    description: str(r, 'description'),
    application_link: str(r, 'application_link'),
    attachments_data: attachments
      .filter((a): a is Loose => !!a && typeof a === 'object')
      .map((a) => ({ id: num(a, 'id'), file_name: str(a, 'file_name'), url: mediaUrl(a) ?? '' }))
      .filter((a) => a.url),
  };
}

/** Maps a loose list with a guard, dropping records that don't match. */
export function narrowList<T>(list: Loose[] | null | undefined, guard: (r: Loose) => T | null): T[] | null {
  if (!Array.isArray(list)) return null;
  return list.map(guard).filter((item): item is T => item !== null);
}
