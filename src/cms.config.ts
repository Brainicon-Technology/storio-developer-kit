import { defineCms, djangoAdapter } from '@/lib/storio-editor';
// The editable pages live in the manifest ("editorPages"), the same list the Storio dashboard
// reads, so the template and the editor can never disagree. Edit content/<page>.json, then run
// `npm run editor:sync`. (Path: public/ from this file.)
import manifest from '../public/storio.template.json';
// Generated from the manifest's "editorIcons" by scripts/storio-editor-sync.mjs: the icons the
// editor's picker offers and <CmsIcon> draws.
import { cmsIcons } from './lib/cms-icons.generated';

type EditorPage = {
  key: string;
  title: string;
  route: string;
  global?: boolean;
  collection?: string;
  parent?: string;
  sections: { key: string; label: string }[];
  defaults?: Record<string, unknown>;
};

const editorPages = ((manifest as unknown as { editorPages?: EditorPage[] }).editorPages ?? []).map((page) => ({
  key: page.key,
  title: page.title,
  route: page.route,
  global: page.global || undefined,
  collection: page.collection,
  parent: page.parent,
  sections: page.sections,
  defaults: page.defaults ?? {},
}));

// Inside the Storio editor preview the admin is signed in to the dashboard on the same domain:
// send their token so drafts show. Visitors have no token and get published content only.
function previewHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = window.localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export const cms = defineCms({
  title: 'Template content',
  // In the browser, /api/cms on the school's domain reaches that school's content (Storio gateway).
  adapter: djangoAdapter({ baseUrl: '/api/cms', credentials: 'same-origin', headers: previewHeaders, media: false }),
  icons: cmsIcons,
  pages: [
    ...editorPages,
  ],
});
