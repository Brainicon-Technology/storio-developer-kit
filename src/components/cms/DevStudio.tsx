'use client';

import { CmsStudio } from '@brainicon/storio-elements-editor/admin';

import { cms } from '@/cms/config';

export function DevStudio() {
  return <CmsStudio config={cms} />;
}
