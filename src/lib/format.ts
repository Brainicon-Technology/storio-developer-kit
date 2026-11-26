/**
 * Display helpers for dates from the SDK ("2026-08-10" or "2026-12-05T09:00:00").
 * A fixed locale and time zone, so the server and the browser render the same text.
 */
export function formatDate(value: string | undefined | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function formatTime(value: string | undefined | null): string {
  if (!value || !value.includes('T')) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}
