#!/usr/bin/env node
// Storio Elements Editor: copies content/<page key>.json into public/storio.template.json
// (editorPages[].defaults), writes lib/cms-icons.generated.ts from "editorIcons", and checks the
// rules the Storio backend enforces.
//   node scripts/storio-editor-sync.mjs           copy defaults, write icons, then check
//   node scripts/storio-editor-sync.mjs --check   check only (used before every build)
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'public', 'storio.template.json');
const contentDirs = [path.join(root, 'content'), path.join(root, 'src', 'content')];
const checkOnly = process.argv.includes('--check');
const KEY = /^[A-Za-z0-9_-]{1,100}$/;
const COLLECTIONS = ['notice', 'blog', 'event']; // the Storio records editable on [slug]/[id] pages
const rel = (p) => path.relative(root, p).split(path.sep).join('/');

const raw = fs.readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(raw);
const id = String(manifest.id || '');
const listed = manifest.editorPages ?? [];
const pages = Array.isArray(listed) ? listed : [];
const errors = [];
const warnings = [];
let changed = false;

// Never end the script with an exit call: Storio's publish security scan refuses it. process.exitCode = 1 below still
// makes `npm run build` (prebuild) fail.
if (!Array.isArray(listed)) errors.push('"editorPages" must be a list.');
if (pages.length > 0 && manifest.editor !== 'storio-elements') {
  warnings.push('No "editor": "storio-elements" in the manifest yet: the dashboard keeps the classic customizer until you add it.');
}

const themeKeys = new Set(['navigation']);
for (const [group, fields] of Object.entries(manifest.customization || {})) {
  if (Array.isArray(fields) && fields.length > 0) themeKeys.add(group);
}

const seen = new Set();
pages.forEach((page, i) => {
  const where = `editorPages[${i}]`;
  if (!page || typeof page !== 'object') return errors.push(`${where} must be an object.`);
  if (typeof page.key !== 'string' || !KEY.test(page.key)) errors.push(`${where}.key: letters, digits, "_" or "-" only.`);
  else if (!page.key.startsWith(`${id}-`)) errors.push(`${where}.key "${page.key}" must start with "${id}-".`);
  else if (seen.has(page.key)) errors.push(`${where}.key "${page.key}" is used twice.`);
  else seen.add(page.key);
  if (typeof page.title !== 'string' || !page.title.trim()) errors.push(`${where}.title is required.`);
  const dynamic = typeof page.route === 'string' && /\[[^\]]+\]/.test(page.route);
  if (typeof page.route !== 'string' || !page.route.startsWith('/')) errors.push(`${where}.route must start with "/".`);
  else if (/[?#]/.test(page.route)) errors.push(`${where}.route must be a path without "?" or "#".`);
  else if (dynamic && !('collection' in page)) errors.push(`${where}.route "${page.route}" needs "collection" (${COLLECTIONS.join(', ')}).`);
  else if (!dynamic && 'collection' in page) errors.push(`${where}.collection needs a route with [slug] or [id].`);
  if ('collection' in page && !COLLECTIONS.includes(page.collection)) errors.push(`${where}.collection must be one of: ${COLLECTIONS.join(', ')}.`);
  if ('parent' in page) {
    const parent = pages.find((p) => p && p.key === page.parent);
    if (!('collection' in page)) errors.push(`${where}.parent is only for pages with "collection".`);
    else if (!parent || parent === page || 'parent' in parent || parent.global) errors.push(`${where}.parent must be the key of another, non-global list page.`);
  }
  if ('global' in page && typeof page.global !== 'boolean') errors.push(`${where}.global must be true or false.`);
  if (page.global === true && ('collection' in page || 'parent' in page)) errors.push(`${where}: the global page cannot have "collection" or "parent".`);
  if (!Array.isArray(page.sections) || (page.sections.length === 0 && !('collection' in page))) return errors.push(`${where}.sections must be a non-empty list.`);
  const sectionKeys = [];
  page.sections.forEach((s, j) => {
    if (!s || typeof s.key !== 'string' || !KEY.test(s.key) || s.key.startsWith('_')) errors.push(`${where}.sections[${j}].key is invalid.`);
    else if (sectionKeys.includes(s.key)) errors.push(`${where}.sections[${j}].key "${s.key}" is used twice.`);
    else sectionKeys.push(s.key);
    if (!s || typeof s.label !== 'string' || !s.label.trim()) errors.push(`${where}.sections[${j}].label is required.`);
  });

  const file = typeof page.key === 'string' ? contentDirs.map((d) => path.join(d, `${page.key}.json`)).find((f) => fs.existsSync(f)) : undefined;
  if (!file) {
    if (!page.defaults || typeof page.defaults !== 'object') errors.push(`${where}: no content/${page.key}.json and no "defaults".`);
    return;
  }
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const k of Object.keys(content)) if (!sectionKeys.includes(k)) errors.push(`${where}: "${k}" in ${rel(file)} is not in "sections".`);
  for (const k of sectionKeys) if (!(k in content)) errors.push(`${where}: section "${k}" has no content in ${rel(file)}.`);
  if (JSON.stringify(page.defaults) !== JSON.stringify(content)) {
    if (checkOnly) errors.push(`${where}: "defaults" differ from ${rel(file)}. Run: npm run editor:sync`);
    else {
      page.defaults = content;
      changed = true;
    }
  }
});

// The Storio dashboard makes Theme settings the editor's site-wide page only when no template page
// is global and no section is named like a Theme settings group; otherwise every <ThemeField>
// pencil (a text read from the customization) stops working.
pages.forEach((p, i) => {
  if (!p || typeof p !== 'object') return;
  if (p.global === true) errors.push(`editorPages[${i}]: "global": true stops the Theme settings pencils from working. Remove it (see STEP 6).`);
  (Array.isArray(p.sections) ? p.sections : []).forEach((s) => {
    if (s && themeKeys.has(s.key)) errors.push(`editorPages[${i}]: section "${s.key}" has the name of a Theme settings group ("navigation" or a "customization" group). Rename it.`);
  });
});

// Icons: "editorIcons" lists lucide-react icon names; the generated file imports exactly those.
const icons = manifest.editorIcons ?? [];
const ICON = /^[A-Z][A-Za-z0-9]{0,63}$/;
if (!Array.isArray(icons)) errors.push('"editorIcons" must be a list of lucide-react icon names.');
else {
  if (icons.length > 300) errors.push('"editorIcons" may list at most 300 icons.');
  icons.forEach((name, i) => {
    if (typeof name !== 'string' || !ICON.test(name)) errors.push(`editorIcons[${i}] must be a lucide-react icon name such as "GraduationCap".`);
    else if (icons.indexOf(name) !== i) errors.push(`editorIcons[${i}] "${name}" is listed twice.`);
  });
}
const iconNames = Array.isArray(icons) ? icons.filter((n) => typeof n === 'string' && ICON.test(n)) : [];
const libDir = fs.existsSync(path.join(root, 'src', 'app')) ? path.join(root, 'src', 'lib') : path.join(root, 'lib');
const iconsFile = path.join(libDir, 'cms-icons.generated.ts');
const iconsSource =
  '// Generated by scripts/storio-editor-sync.mjs from "editorIcons" in public/storio.template.json.\n' +
  '// Do not edit: add or remove icon names in the manifest, then run `npm run editor:sync`.\n' +
  (iconNames.length ? `import { ${iconNames.join(', ')} } from 'lucide-react';\n\n` : '\n') +
  `export const cmsIcons = ${iconNames.length ? `{ ${iconNames.join(', ')} }` : '{}'};\n`;
const currentIcons = fs.existsSync(iconsFile) ? fs.readFileSync(iconsFile, 'utf8').replace(/\r\n/g, '\n') : null;
if (currentIcons !== iconsSource) {
  if (checkOnly) errors.push(`${rel(iconsFile)} is missing or out of date. Run: npm run editor:sync`);
  else {
    fs.mkdirSync(libDir, { recursive: true });
    fs.writeFileSync(iconsFile, iconsSource);
    console.log(`storio-editor-sync: wrote ${rel(iconsFile)} (${iconNames.length} icon(s))`);
  }
}

if (changed && !checkOnly) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2).replace(/\n/g, eol) + eol);
  console.log(`storio-editor-sync: updated defaults in ${rel(manifestPath)}`);
}
if (warnings.length > 0) console.warn('storio-editor-sync warning:\n- ' + warnings.join('\n- '));
if (errors.length > 0) {
  console.error('storio-editor-sync found problems:\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log(`storio-editor-sync: ${pages.length} editor page(s) OK`);
}
