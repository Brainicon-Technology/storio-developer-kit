import { getAllPageContent } from '@brainicon/storio-elements-editor/next';

import { cmsPages } from '@/cms/pages';
import { getCmsStorage } from '@/lib/cms-storage';
import { CmsClientProviders } from './CmsClientProviders';

/**
 * Loads the published content of every page on the server and hands it to the
 * client provider. The HTML then already contains the edited text (good for SEO,
 * no flash of default content), and pages only need usePageContent().
 */
export async function CmsProviders({ children }: { children: React.ReactNode }) {
  const initialContent = await getAllPageContent({ pages: cmsPages }, { storage: await getCmsStorage() });
  return <CmsClientProviders initialContent={initialContent}>{children}</CmsClientProviders>;
}
