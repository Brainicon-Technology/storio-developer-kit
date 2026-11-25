import type { CmsStorageAdapter } from '../core/types';
import { restAdapter, type RestAdapterOptions } from './rest';

export interface DjangoAdapterOptions extends Omit<RestAdapterOptions, 'headers'> {
  /** Extra headers, e.g. an Authorization header if your AUTHORIZE check uses tokens. */
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
}

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Adapter for Storio's /api/cms/ API. Same API as `restAdapter`, plus
 * Django's CSRF handling: it fetches a token from `{baseUrl}/csrf`, sends it as
 * `X-CSRFToken` on writes, and refreshes it once if Django rejects it.
 *
 * Cookies are sent with every request (`credentials: "include"` by default) so
 * Django's session login identifies the editor, even on another domain.
 */
export function djangoAdapter(options: DjangoAdapterOptions): CmsStorageAdapter {
  const base = options.baseUrl.replace(/\/+$/, '');
  const credentials = options.credentials ?? 'include';
  const baseFetch = options.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  let token: Promise<string> | null = null;

  const extraHeaders = async () =>
    typeof options.headers === 'function' ? await options.headers() : options.headers ?? {};

  const getToken = (refresh = false): Promise<string> => {
    if (!token || refresh) {
      token = (async () => {
        const res = await baseFetch(`${base}/csrf`, {
          credentials,
          headers: { Accept: 'application/json', ...(await extraHeaders()) },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Could not get a CSRF token (status ${res.status})`);
        const body = (await res.json()) as { csrfToken?: string };
        return body.csrfToken ?? '';
      })().catch((err) => {
        token = null; // let the next write try again
        throw err;
      });
    }
    return token;
  };

  const csrfFetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const method = (init.method ?? 'GET').toUpperCase();
    if (!UNSAFE.has(method)) return baseFetch(input, init);

    const send = async (refresh: boolean) => {
      const headers = new Headers(init.headers);
      headers.set('X-CSRFToken', await getToken(refresh));
      return baseFetch(input, { ...init, headers });
    };

    const res = await send(false);
    // A stale token (e.g. after login rotated it) gives 403: refresh once and retry.
    return res.status === 403 ? send(true) : res;
  }) as typeof fetch;

  return restAdapter({
    ...options,
    credentials,
    headers: extraHeaders,
    fetch: csrfFetch,
  });
}
