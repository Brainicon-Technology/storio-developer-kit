#!/usr/bin/env node
// Sets this template's id everywhere it is used. Every editor page key starts with the template id
// ("<id>-home"), and so do the content files (src/content/<id>-home.json) and the page keys in the
// code, so changing the id by hand is easy to get wrong. Run this instead:
//   npm run template:id -- template-9-sunrise    set the id (and rename everything that uses it)
//   npm run template:id -- --check               warn if the id is still the starter's
// It never ends with an exit call (Storio's publish security scan refuses that); problems set
// process.exitCode instead.
import fs from 'node:fs';
import path from 'node:path';

const STARTER_ID = 'template-0-starter';
const ID = /^template-\d+-[a-z0-9-_]+$/; // the format Storio accepts (storio validate)
const root = process.cwd();
const manifestPath = path.join(root, 'public', 'storio.template.json');
const srcDir = path.join(root, 'src');
const rel = (p) => path.relative(root, p).split(path.sep).join('/');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const oldId = String(manifest.id || '');
const arg = process.argv.slice(2).find((a) => !a.startsWith('--'));

if (process.argv.includes('--check')) {
  if (oldId === STARTER_ID) {
    console.warn(`storio-template-id warning: the template id is still "${STARTER_ID}". Before you publish, run: npm run template:id -- template-<number>-<name>`);
  }
} else if (!arg) {
  console.error('Usage: npm run template:id -- template-<number>-<name>   (for example template-9-sunrise)');
  process.exitCode = 1;
} else if (!ID.test(arg)) {
  console.error(`"${arg}" is not a Storio template id. Use template-<number>-<name>, lowercase, for example template-9-sunrise.`);
  process.exitCode = 1;
} else if (arg === oldId) {
  console.log(`The template id is already "${arg}".`);
} else {
  const replaceIn = (text) => text.split(`${oldId}-`).join(`${arg}-`);

  // 1. Code and content under src/: page keys such as '<id>-home' and content file imports.
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : [p];
    });
  let files = 0;
  for (const file of walk(srcDir).filter((f) => /\.(tsx?|jsx?|mjs|json)$/.test(f))) {
    const text = fs.readFileSync(file, 'utf8');
    const next = replaceIn(text);
    if (next !== text) {
      fs.writeFileSync(file, next);
      files += 1;
    }
  }

  // 2. Content files: src/content/<old id>-home.json -> src/content/<new id>-home.json.
  const contentDir = path.join(srcDir, 'content');
  const renamed = [];
  for (const name of fs.existsSync(contentDir) ? fs.readdirSync(contentDir) : []) {
    if (name.startsWith(`${oldId}-`)) {
      const to = `${arg}-${name.slice(oldId.length + 1)}`;
      fs.renameSync(path.join(contentDir, name), path.join(contentDir, to));
      renamed.push(`${name} -> ${to}`);
    }
  }

  // 3. The manifest: the id and every editor page key / parent.
  manifest.id = arg;
  for (const page of Array.isArray(manifest.editorPages) ? manifest.editorPages : []) {
    if (typeof page.key === 'string') page.key = replaceIn(page.key);
    if (typeof page.parent === 'string') page.parent = replaceIn(page.parent);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`Template id: "${oldId}" -> "${arg}"`);
  console.log(`- ${rel(manifestPath)}: id and ${manifest.editorPages?.length ?? 0} editor page key(s)`);
  console.log(`- ${files} file(s) under src/ updated`);
  for (const line of renamed) console.log(`- renamed src/content/${line}`);
  console.log('Next: npm run editor:check');
}
