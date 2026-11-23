/**
 * Copies the editable pages of this template (src/cms/pages.ts) into
 * public/storio.template.json under "editor", and sets "sdkVersion": 2.
 *
 * The Storio backend reads that manifest when the template is published, and the
 * tenant dashboard builds its editor screen from the "editor" block.
 *
 * Run it after every change to src/cms/pages.ts or src/content/*.json:
 *   npm run cms:manifest
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

import { cmsCollectionLimits, cmsPages, cmsStyles, iconNames } from '../src/cms/pages';

const MANIFEST_PATH = path.join(process.cwd(), 'public', 'storio.template.json');

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Record<string, unknown>;

const editor = {
  library: '@brainicon/storio-elements-editor',
  pages: cmsPages,
  icons: [...iconNames],
  styles: cmsStyles,
  collectionLimits: cmsCollectionLimits,
};

const { customization: _legacyCustomization, ...rest } = manifest;
void _legacyCustomization;

const next = { ...rest, sdkVersion: 2, editor };

writeFileSync(MANIFEST_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
console.log(`Updated ${path.relative(process.cwd(), MANIFEST_PATH)}: ${cmsPages.length} pages, ${iconNames.length} icons.`);
