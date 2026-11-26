/**
 * Rule 1 (Tenant DB vs. Standalone Preview) in one place.
 *
 * - Real data present: use it.
 * - Empty, in Standalone Preview: use the demo data, so the design can be previewed.
 * - Empty, for a linked or live tenant: return an empty list. Never show demo data there.
 */
export function withDemoFallback<T>(real: T[] | null | undefined, demo: T[], isStandalone: boolean): T[] {
  if (Array.isArray(real) && real.length > 0) return real;
  return isStandalone ? demo : [];
}

/** The same rule for a single record (for example a notice detail). */
export function withDemoRecord<T>(real: T | null | undefined, demo: T | undefined, isStandalone: boolean): T | null {
  if (real) return real;
  return isStandalone && demo ? demo : null;
}

/** An SDK call that never throws: a network or server error counts as "no data". */
export function safely<T>(request: Promise<T>): Promise<T | null> {
  return request.catch(() => null);
}

/** Sorts records by their dashboard "order" field (records without one go first). */
export function byOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
