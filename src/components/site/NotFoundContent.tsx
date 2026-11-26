import Link from 'next/link';

import ThemeField from '@/components/cms/ThemeField';
import { loadTheme, themeText } from '@/lib/theme';
import { resolveTenant } from '@/lib/tenant';

/**
 * The 404 page body. A 404 is not an editor page (it has no route of its own), so its texts are
 * Theme settings fields (customization.content: not_found_title, not_found_text, not_found_link),
 * editable with a pencil like the header and footer texts.
 */
export async function NotFoundContent() {
  const theme = await loadTheme(await resolveTenant());

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="text-7xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-3xl font-bold">
        <ThemeField field="not_found_title" label="404 title">{themeText(theme, 'not_found_title')}</ThemeField>
      </h1>
      <p className="mt-3 opacity-80">
        <ThemeField field="not_found_text" label="404 text">{themeText(theme, 'not_found_text')}</ThemeField>
      </p>
      <Link href="/" className="mt-8 rounded-xl bg-brand px-5 py-3 font-semibold text-white">
        <ThemeField field="not_found_link" label="404 link">{themeText(theme, 'not_found_link')}</ThemeField>
      </Link>
    </main>
  );
}
