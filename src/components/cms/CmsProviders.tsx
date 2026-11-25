import { connection } from 'next/server';
import { getAllPageContent } from '@/lib/storio-editor/server';
import { STYLES_KEY } from '@/lib/storio-editor/core/styles';
import { cms } from '@/cms.config';
import { serverCmsStorage } from '@/lib/cms-server-storage';
import { THEME_PAGE } from './themePage';
import { CmsClientProviders } from './CmsClientProviders';

// Loads the school's published content on the server, so the first HTML already contains the
// edited text. If Storio cannot be reached, every page falls back to its defaults.
export async function CmsProviders({ children }: { children: React.ReactNode }) {
  await connection(); // content can change at any moment from the dashboard
  const storage = await serverCmsStorage();
  const [initialContent, themeStyles] = await Promise.all([
    cms.pages.length > 0 ? getAllPageContent(cms, { storage }) : Promise.resolve({}),
    // Styles of the texts with a Theme settings pencil (<ThemeField>), so they render on the server.
    storage.getRecord(THEME_PAGE, STYLES_KEY).catch(() => null),
  ]);
  const content: Record<string, Record<string, unknown>> = { ...initialContent };
  if (themeStyles?.content && typeof themeStyles.content === 'object') {
    content[THEME_PAGE] = { [STYLES_KEY]: themeStyles.content };
  }
  return <CmsClientProviders initialContent={content}>{children}</CmsClientProviders>;
}
