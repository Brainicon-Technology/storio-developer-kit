import type { ReactNode } from 'react';
import Link from 'next/link';

/** A category from getBlogCategories / getActivityCategories / getEventCategories. */
export interface CategoryTab {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

/** The value of ?category=: the slug, or the id when the dashboard left the slug empty. */
export const categoryKey = (c: { id: number; slug?: string | null }) => c.slug || String(c.id);

/**
 * Filter tabs for a list page: "All" plus one link per category, as ?category=<slug> (see categoryKey).
 * The server page reads the slug, finds the category's id and passes it to the SDK filter
 * (getBlogs({ category: id }), getActivities({ category: id }), getEvents({ categories: id })).
 * Category names are school data (no pencil); the "All" label is page content, passed in.
 */
export function CategoryTabs({ path, categories, active, allLabel }: { path: string; categories: CategoryTab[]; active?: string; allLabel: ReactNode }) {
  if (categories.length === 0) return null;
  const tab = (selected: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold ${selected ? 'bg-brand text-white' : 'border border-black/10 hover:border-brand hover:text-brand'}`;

  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      <Link href={path} className={tab(!active)} aria-current={!active ? 'page' : undefined}>
        {allLabel}
      </Link>
      {categories.map((c) => (
        <Link key={c.id} href={`${path}?category=${encodeURIComponent(categoryKey(c))}`} className={tab(active === categoryKey(c))} aria-current={active === categoryKey(c) ? 'page' : undefined}>
          {c.name}
          {c.count !== undefined && <span className="ml-1 opacity-60">{c.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
