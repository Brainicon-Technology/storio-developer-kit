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
