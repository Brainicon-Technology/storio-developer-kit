import type { CmsStorageAdapter, CollectionItemSummary, ListOptions, MediaItem, SaveRecordInput, SectionRecord } from '../core/types';

export interface RestAdapterOptions {
  /** Base URL of the CMS API, e.g. "/api/cms" or "https://api.example.com/cms". */
  baseUrl: string;
  /** Extra request headers (for example an Authorization header), or a function returning them. */
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  /** Fetch credentials mode. Defaults to "same-origin" so session cookies are sent. */
  credentials?: RequestCredentials;
  /** Set to false when the server does not implement the /media endpoints. */
  media?: boolean;
  /** Custom fetch implementation (tests, polyfills). */
  fetch?: typeof fetch;
}

/** Error thrown for non-2xx responses; carries the HTTP status. */
export class CmsRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'CmsRequestError';
  }
}

const enc = encodeURIComponent;

/**
 * Adapter that talks to a CMS HTTP API. The contract (implemented by
 * `createCmsRouteHandler` and documented in the README):
 *
 *   GET    {base}/records?page=&drafts=1     -> SectionRecord[]
 *   GET    {base}/records/:page/:section     -> SectionRecord, or null when never edited
 *   PUT    {base}/records/:page/:section     body { content, isPublished } -> SectionRecord
 *   DELETE {base}/records/:page/:section     -> 204
 *   GET    {base}/media                      -> MediaItem[]
 *   POST   {base}/media                      multipart "files" -> { items: MediaItem[] }
 *   GET    {base}/collections/:c/items       -> CollectionItemSummary[]
 *   GET    {base}/collections/:c/items/:id   -> the record's editable values (404 when missing)
 *   PUT    {base}/collections/:c/items/:id   body { values } -> the record's values after saving
 */
export function restAdapter(options: RestAdapterOptions): CmsStorageAdapter {
  const base = options.baseUrl.replace(/\/+$/, '');
  const doFetch = options.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));

  async function request<T>(path: string, init: RequestInit = {}, allow404 = false): Promise<T | null> {
    const extra = typeof options.headers === 'function' ? await options.headers() : options.headers;
    const headers = new Headers(extra);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await doFetch(`${base}${path}`, {
      ...init,
      headers,
      credentials: options.credentials ?? 'same-origin',
      cache: 'no-store',
    });

    if (allow404 && res.status === 404) return null;
    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;
      try {
        const body = (await res.json()) as { detail?: string; error?: string };
        message = body.detail || body.error || message;
      } catch {
        // Non-JSON error body.
      }
      throw new CmsRequestError(message, res.status);
    }
    if (res.status === 204) return null;
    return (await res.json()) as T;
  }

  const draftsQuery = (opts?: ListOptions) => (opts?.includeDrafts ? 'drafts=1' : '');

  const adapter: CmsStorageAdapter = {
    async listRecords(page?: string, opts?: ListOptions) {
      const params = [page ? `page=${enc(page)}` : '', draftsQuery(opts)].filter(Boolean).join('&');
      const data = await request<SectionRecord[]>(`/records${params ? `?${params}` : ''}`);
      return Array.isArray(data) ? data : [];
    },

    async getRecord(page: string, sectionKey: string, opts?: ListOptions) {
      const q = draftsQuery(opts);
      return request<SectionRecord>(`/records/${enc(page)}/${enc(sectionKey)}${q ? `?${q}` : ''}`, {}, true);
    },

    async saveRecord(input: SaveRecordInput) {
      const data = await request<SectionRecord>(`/records/${enc(input.page)}/${enc(input.sectionKey)}`, {
        method: 'PUT',
        body: JSON.stringify({ content: input.content, isPublished: input.isPublished }),
      });
      if (!data) throw new CmsRequestError('Empty response from server', 500);
      return data;
    },

    async deleteRecord(page: string, sectionKey: string) {
      await request(`/records/${enc(page)}/${enc(sectionKey)}`, { method: 'DELETE' }, true);
    },

    async listItems(collection: string) {
      const data = await request<CollectionItemSummary[]>(`/collections/${enc(collection)}/items`);
      return Array.isArray(data) ? data : [];
    },

    async getItem(collection: string, id: string) {
      return request<Record<string, unknown>>(`/collections/${enc(collection)}/items/${enc(id)}`, {}, true);
    },

    async saveItem(collection: string, id: string, values: Record<string, unknown>) {
      const data = await request<Record<string, unknown>>(`/collections/${enc(collection)}/items/${enc(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ values }),
      });
      if (!data) throw new CmsRequestError('Empty response from server', 500);
      return data;
    },
  };

  if (options.media !== false) {
    adapter.listMedia = async () => {
      const data = await request<MediaItem[]>('/media');
      return Array.isArray(data) ? data : [];
    };
    adapter.uploadMedia = async (files: File[]) => {
      const form = new FormData();
      files.forEach((file) => form.append('files', file));
      const data = await request<{ items: MediaItem[] }>('/media', { method: 'POST', body: form });
      return data?.items ?? [];
    };
  }

  return adapter;
}
