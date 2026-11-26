import type {
  StorioActivityItem,
  StorioBlogPost,
  StorioBoardNotice,
  StorioClassRoutine,
  StorioEvent,
  StorioGalleryItem,
  StorioHeroSlide,
  StorioMpoInfo,
  StorioNotice,
  StorioPromotion,
  StorioStaffMember,
  StorioTeamMember,
} from '@storio/template-sdk';

/**
 * ============================================================================
 * Normalizers: real backend records -> the SDK types the pages use
 * ============================================================================
 * The live Storio API does not always match the SDK's TypeScript types: some
 * fields have other names (hero slide "heading" instead of "title"), images are
 * nested media objects with relative paths ("/media/uploads/x.webp"), and
 * events come paginated ({ count, results }).
 *
 * Every loader in src/lib runs the SDK result through one of these functions
 * BEFORE the Rule 1 fallback, so views only ever see the SDK shape, and the
 * SDK's own field names keep working if the backend sends them.
 * Demo data is already in the SDK shape and never goes through here.
 * ============================================================================
 */

type Loose = Record<string, unknown>;

const isObj = (v: unknown): v is Loose => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === 'string' && v !== '' ? v : undefined);
const num = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);
const loose = (v: unknown): Loose => (isObj(v) ? v : {});

/** A list from the SDK, or from a paginated response ({ results: [...] }). */
export function listOf(value: unknown): Loose[] | null {
  if (Array.isArray(value)) return value.filter(isObj);
  if (isObj(value) && Array.isArray(value.results)) return value.results.filter(isObj);
  return null;
}

/** The backend's base URL: relative media paths ("/media/...") are served from it. */
function backendBase(): string {
  return (process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
}

/** An absolute URL for a media path or a media object ({ file_url } / { file } / { url }). */
export function mediaUrl(value: unknown): string | undefined {
  const path = isObj(value) ? str(value.file_url) ?? str(value.file) ?? str(value.url) : str(value);
  if (!path) return undefined;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  const base = backendBase();
  return base && path.startsWith('/') ? `${base}${path}` : path;
}

/** "2026-11-25T00:00:00Z" stays as is; formatDate() in the views shows it. */
const date = (...values: unknown[]) => values.map(str).find(Boolean);

/** Plain text (with line breaks) as simple HTML, for fields <RichText> renders. HTML stays as is. */
export function textToHtml(text: string): string {
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escape(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

const active = (r: Loose) => r.status === undefined || ['active', 'published'].includes(String(r.status)) || r.status === true;

export function normalizeHeroSlides(value: unknown): StorioHeroSlide[] | null {
  return listOf(value)?.filter(active).map((r) => ({
    id: num(r.id) ?? 0,
    title: str(r.title) ?? str(r.heading),
    subtitle: str(r.subtitle) ?? str(r.subheading),
    button_text: str(r.button_text) ?? str(r.buttonText),
    button_url: str(r.button_url) ?? str(r.buttonLink),
    image_url: mediaUrl(r.image_url) ?? mediaUrl(r.bgImage_url) ?? mediaUrl(r.bgImage_data),
    order: num(r.order),
  })) ?? null;
}

function toNotice(r: Loose): StorioNotice {
  const attachments = Array.isArray(r.attachments_detail) ? r.attachments_detail : [];
  return {
    id: num(r.id) ?? 0,
    title: str(r.title) ?? '',
    slug: str(r.slug),
    content: str(r.content),
    published_date: date(r.published_date, r.publish_date, r.create_date),
    is_urgent: r.is_urgent === true || r.priority === 'urgent',
    attachment_url: mediaUrl(r.attachment_url) ?? mediaUrl(attachments[0]),
  };
}
export const normalizeNotices = (value: unknown): StorioNotice[] | null => listOf(value)?.map(toNotice) ?? null;
export const normalizeNotice = (value: unknown): StorioNotice | null => (isObj(value) && value.id !== undefined ? toNotice(value) : null);

function toBlog(r: Loose): StorioBlogPost {
  const categories = Array.isArray(r.categories_data) ? r.categories_data : [];
  return {
    id: num(r.id) ?? 0,
    title: str(r.title) ?? '',
    slug: str(r.slug) ?? String(r.id ?? ''),
    summary: str(r.summary) ?? str(r.excerpt),
    content: str(r.content),
    featured_image_url: mediaUrl(r.featured_image_url) ?? mediaUrl(r.featured_image_data),
    category_name: str(r.category_name) ?? str(loose(categories[0]).name),
    published_at: date(r.published_at, r.publish_date, r.create_date),
  };
}
export const normalizeBlogs = (value: unknown): StorioBlogPost[] | null => listOf(value)?.map(toBlog) ?? null;
export const normalizeBlog = (value: unknown): StorioBlogPost | null => (isObj(value) && value.id !== undefined ? toBlog(value) : null);

function toActivity(r: Loose): StorioActivityItem {
  return {
    id: num(r.id) ?? 0,
    title: str(r.title) ?? '',
    slug: str(r.slug),
    summary: str(r.summary),
    excerpt: str(r.excerpt),
    content: str(r.content),
    featured_image_url: mediaUrl(r.featured_image_url) ?? mediaUrl(r.featured_image_data),
    image: mediaUrl(r.image),
    published_at: date(r.published_at, r.publish_date),
    date: date(r.date, r.create_date),
  };
}
export const normalizeActivities = (value: unknown): StorioActivityItem[] | null => listOf(value)?.map(toActivity) ?? null;
export const normalizeActivity = (value: unknown): StorioActivityItem | null => (isObj(value) && value.id !== undefined ? toActivity(value) : null);

function toEvent(r: Loose): StorioEvent {
  const detail = loose(r.featured_image_detail);
  const categories = Array.isArray(r.categories_detail) ? r.categories_detail.filter(isObj) : [];
  return {
    id: num(r.id) ?? 0,
    title: str(r.title) ?? '',
    slug: str(r.slug),
    content: str(r.content),
    excerpt: str(r.excerpt),
    location: str(r.location),
    start_date: str(r.start_date),
    end_date: str(r.end_date),
    status: str(r.status),
    is_featured: r.is_featured === true,
    // The SDK types featured_image as a URL; the backend sends a media id plus a detail object.
    featured_image: mediaUrl(detail) ?? (typeof r.featured_image === 'string' ? mediaUrl(r.featured_image) : undefined),
    categories_detail: categories.map((c) => ({ id: num(c.id), name: str(c.name), slug: str(c.slug) })),
  };
}
export const normalizeEvents = (value: unknown): StorioEvent[] | null => listOf(value)?.map(toEvent) ?? null;
export const normalizeEvent = (value: unknown): StorioEvent | null => (isObj(value) && value.id !== undefined ? toEvent(value) : null);

export function normalizeStaff(value: unknown): StorioStaffMember[] | null {
  return listOf(value)?.filter(active).map((r) => ({
    id: num(r.id) ?? 0,
    name: str(r.name) ?? '',
    designation: str(r.designation) ?? str(r.role),
    department: str(r.department),
    photo_url: mediaUrl(r.photo_url) ?? mediaUrl(r.profile_pic_data),
    email: str(r.email),
    phone_number: str(r.phone_number) ?? str(r.phone),
    bio: str(r.bio),
    is_mpo: r.is_mpo === true,
  })) ?? null;
}

export function normalizeTeam(value: unknown): StorioTeamMember[] | null {
  return listOf(value)?.map((r) => {
    const image = loose(r.image_data);
    return {
      ...(r as unknown as StorioTeamMember),
      image_data: isObj(r.image_data) ? { ...image, file_url: mediaUrl(image), alt_text: str(image.alt_text) } : null,
    };
  }) ?? null;
}

/** A gallery photo, with the id of its album (the backend links photos to albums, not the reverse). */
export type GalleryPhoto = StorioGalleryItem & { album?: number };

export function normalizeGallery(value: unknown): GalleryPhoto[] | null {
  return listOf(value)
    ?.filter((r) => r.is_visible !== false)
    .map((r) => ({
      id: num(r.id) ?? 0,
      title: str(r.title) ?? str(r.image_title),
      image_url: mediaUrl(r.image_url) ?? mediaUrl(r.media_data) ?? '',
      caption: str(r.caption) ?? str(r.alt_text),
      album: num(r.album),
    }))
    .filter((p) => p.image_url) ?? null;
}

export function normalizePromotions(value: unknown): StorioPromotion[] | null {
  return listOf(value)?.filter((r) => r.is_live !== false && active(r)).map((r) => ({
    ...(r as unknown as StorioPromotion),
    image: mediaUrl(r.image_detail) ?? mediaUrl(r.image),
    cta_url: str(r.cta_url),
  })) ?? null;
}

export function normalizeBoardNotices(value: unknown): StorioBoardNotice[] | null {
  return listOf(value)?.map((r) => ({
    id: num(r.id),
    title: str(r.title),
    publish_date: str(r.publish_date),
    url: str(r.url),
    board: str(r.board) ?? str(r.board_name),
  })) ?? null;
}

/** Routine periods: the backend sends teacher_name / period_number / room_no. */
export function normalizeClassRoutines(value: unknown): StorioClassRoutine[] | null {
  return listOf(value)?.map((r) => {
    const routine = r as unknown as StorioClassRoutine;
    const days = Array.isArray(r.schedule) ? r.schedule.filter(isObj) : null;
    return {
      ...routine,
      routine_file_url: mediaUrl(r.routine_file_url),
      schedule: days
        ? days.map((d) => ({
            day: str(d.day) ?? '',
            periods: (Array.isArray(d.periods) ? d.periods : Array.isArray(d.slots) ? d.slots : []).filter(isObj).map((p) => ({
              period: num(p.period) ?? num(p.period_number),
              subject: str(p.subject),
              teacher: str(p.teacher) ?? str(p.teacher_name),
              room: str(p.room) ?? str(p.room_no),
              start_time: str(p.start_time),
              end_time: str(p.end_time),
            })),
          }))
        : routine.schedule,
    };
  }) ?? null;
}

/** MPO documents: the backend calls the document's name "name". */
export function normalizeMpoInfo(value: StorioMpoInfo | null): StorioMpoInfo | null {
  if (!value) return null;
  return {
    ...value,
    documents: (value.documents ?? []).map((doc) => {
      const d = doc as unknown as Loose;
      return { title: str(d.title) ?? str(d.name), file_url: mediaUrl(d.file_url), issue_date: str(d.issue_date) };
    }),
  };
}
