#!/usr/bin/env node
// Checks that every page's code is editable in the Storio dashboard editor.
//
// `npm run editor:check` checks the manifest against src/content/*.json. This script checks the code:
//   - every editor page has its route file, its metadata (pageMetadata('<key>')) and a "seo" section,
//   - every section of a page has a <CmsSection sectionKey="..." page={PAGE}> in the code,
//   - every <CmsSection> and <CmsField> points to a page, section and path that exist,
//   - record fields (collection="notice" | "blog" | "event") use only the fields Storio can save,
//   - <ThemeField field="..."> points to a field of the manifest's "customization",
//   - no static text in the markup: a word written in JSX (or in alt/placeholder/title/aria-label)
//     can't be edited by the school. Move it into src/content/<key>.json and wrap it in <CmsField>,
//   - no demo data imported outside src/lib (demo data is only for Standalone, via withDemoFallback).
//
// Run: npm run pages:check   (also part of npm run storio:check and of every build)
// A line can opt out with a comment containing "storio-check-ignore" on it or on the line above.
// It never ends with an exit call (Storio's publish security scan refuses that); problems set
// process.exitCode instead.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public', 'storio.template.json'), 'utf8'));
const errors = [];
const warnings = [];

/** The record fields Storio saves from the editor (the backend refuses any other). */
const RECORD_FIELDS = { notice: ['title'], blog: ['title', 'excerpt'], event: ['title', 'excerpt', 'location'] };
/** JSX attributes a visitor reads: a literal word in them can't be edited. */
const TEXT_ATTRIBUTES = new Set(['alt', 'placeholder', 'title', 'aria-label', 'aria-description']);
/** Content keys that are settings, not visible text: not reported as unused. */
const NOT_TEXT = /(^id$|href$|url$|link$|Href$|Url$|Link$|^seo$)/;
const IGNORE = 'storio-check-ignore';

// ---------------------------------------------------------------- manifest + content
const pages = new Map();
for (const page of Array.isArray(manifest.editorPages) ? manifest.editorPages : []) {
  if (!page || typeof page.key !== 'string') continue;
  const file = path.join(root, 'src', 'content', `${page.key}.json`);
  const content = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : page.defaults ?? {};
  pages.set(page.key, {
    ...page,
    content,
    sectionKeys: (page.sections ?? []).map((s) => s.key),
    usedSections: new Set(),
    usedPaths: new Set(),
    dynamicSections: new Set(),
  });
}
const themeFields = new Map(); // group -> Set(field ids)
for (const [group, fields] of Object.entries(manifest.customization ?? {})) {
  if (Array.isArray(fields)) themeFields.set(group, new Set(fields.map((f) => f?.id).filter(Boolean)));
}

// ---------------------------------------------------------------- source files
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full === path.join(root, 'src', 'lib', 'storio-editor')) continue; // the editor kit: fixed protocol
      walk(full, out);
    } else if (/\.(tsx|ts)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

/** Route ("/events/[id]") -> src/app/.../page.tsx, with route groups like "(site)" removed. */
const routeFiles = new Map();
for (const file of walk(path.join(root, 'src', 'app'))) {
  if (!/[\\/]page\.tsx$/.test(file)) continue;
  const segments = path.relative(path.join(root, 'src', 'app'), path.dirname(file)).split(path.sep);
  const route = '/' + segments.filter((s) => s && !/^\(.*\)$/.test(s)).join('/');
  routeFiles.set(route, file);
}

const codeFiles = [...walk(path.join(root, 'src', 'components')), ...walk(path.join(root, 'src', 'app'))].filter((f) =>
  f.endsWith('.tsx'),
);
// Files where static text is a rule: what visitors see. src/components/cms is editor plumbing.
const textRuleApplies = (file) => !rel(file).startsWith('src/components/cms/');

for (const file of codeFiles) checkFile(file);
for (const file of [...walk(path.join(root, 'src', 'components')), ...walk(path.join(root, 'src', 'app'))]) checkDemoImports(file);
checkPages();

// ---------------------------------------------------------------- per file
function checkFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!/Cms(Section|Field)|ThemeField|<[a-zA-Z]/.test(text)) return;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const lines = text.split(/\r?\n/);
  const at = (node) => {
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line;
    return { line: line + 1, ignored: [lines[line], lines[line - 1]].some((l) => l?.includes(IGNORE)) };
  };
  const report = (node, message, list = errors) => {
    const { line, ignored } = at(node);
    if (!ignored) list.push(`${rel(file)}:${line}  ${message}`);
  };

  // Top-level string constants (const PAGE = '<key>') so page={PAGE} can be resolved.
  const constants = new Map();
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const d of statement.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.initializer && ts.isStringLiteralLike(d.initializer)) constants.set(d.name.text, d.initializer.text);
    }
  }
  // The page this file belongs to: its PAGE constant, or the only editor page key it names.
  const filePage = [...constants.values()].find((v) => pages.has(v));

  const tagName = (node) => node.tagName.getText(source);
  const attr = (node, name) => node.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name.getText(source) === name);
  /** { value } for a literal (or a constant), { dynamic: true } for anything else, undefined when absent. */
  const attrValue = (node, name) => {
    const a = attr(node, name);
    if (!a) return undefined;
    if (!a.initializer) return { value: 'true' };
    if (ts.isStringLiteral(a.initializer)) return { value: a.initializer.text };
    const e = a.initializer.expression;
    if (!e) return { dynamic: true };
    if (ts.isStringLiteralLike(e)) return { value: e.text };
    if (ts.isIdentifier(e) && constants.has(e.text)) return { value: constants.get(e.text) };
    if (ts.isTemplateExpression(e)) {
      // items.${i}.title -> items.0.title (checked against the first item of the list)
      return { value: e.head.text + e.templateSpans.map((s) => '0' + s.literal.text).join(''), template: true };
    }
    return { dynamic: true };
  };

  const visit = (node, ctx) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const name = tagName(opening);
      let next = ctx;

      if (name === 'CmsSection') next = checkSection(opening, ctx);
      else if (name === 'CmsField') next = { ...checkField(opening, ctx), inField: true };
      else if (name === 'ThemeField') {
        checkThemeField(opening);
        next = { ...ctx, inField: true };
      } else if (/^[a-z]/.test(name) && textRuleApplies(file)) {
        for (const a of opening.attributes.properties) {
          if (!ts.isJsxAttribute(a) || !TEXT_ATTRIBUTES.has(a.name.getText(source))) continue;
          const v = a.initializer;
          const literal = v && (ts.isStringLiteral(v) ? v.text : v.expression && ts.isStringLiteralLike(v.expression) ? v.expression.text : null);
          if (literal && /\p{L}/u.test(literal)) {
            report(a, `static text in ${a.name.getText(source)}="${literal}": put it in the page's content JSON and pass the value.`);
          }
        }
      }

      if (ts.isJsxElement(node)) node.children.forEach((child) => visit(child, next));
      else ts.forEachChild(node, (child) => visit(child, next));
      return;
    }

    if (ts.isJsxText(node) && textRuleApplies(file)) {
      const words = node.text.trim();
      if (/\p{L}/u.test(words)) {
        report(
          node,
          `static text "${short(words)}": the school can't edit it. Add it to src/content/<page>.json and render it with <CmsField path="...">{value}</CmsField>.`,
        );
      }
      return;
    }

    if (ts.isJsxExpression(node) && node.expression && textRuleApplies(file) && isJsxChild(node)) {
      for (const literal of literalsIn(node.expression)) {
        if (/\p{L}/u.test(literal.text)) {
          report(literal, `static text "${short(literal.text)}": put it in the page's content JSON and wrap it with <CmsField>.`);
        }
      }
    }

    ts.forEachChild(node, (child) => visit(child, ctx));
  };

  function checkSection(opening, ctx) {
    const section = attrValue(opening, 'sectionKey');
    const page = attrValue(opening, 'page');
    if (!page) {
      report(opening, '<CmsSection> needs page={PAGE} (the editor page key). Without it the section belongs to no page.');
      return { ...ctx, page: undefined, section: undefined };
    }
    if (page.dynamic || !section || section.dynamic) return { ...ctx, page: page.value, section: section?.value, unknown: true };
    const entry = pages.get(page.value);
    if (!entry) {
      report(opening, `<CmsSection page="${page.value}">: no such page in "editorPages" of public/storio.template.json.`);
      return { ...ctx, page: undefined, section: undefined };
    }
    if (!entry.sectionKeys.includes(section.value)) {
      report(
        opening,
        `<CmsSection sectionKey="${section.value}">: page "${page.value}" has no such section. Add it to src/content/${page.value}.json and run npm run editor:sync.`,
      );
    } else entry.usedSections.add(section.value);
    return { ...ctx, page: page.value, section: section.value, unknown: false };
  }

  function checkField(opening, ctx) {
    const collection = attrValue(opening, 'collection');
    const fieldPath = attrValue(opening, 'path');
    if (!fieldPath) {
      report(opening, '<CmsField> needs a path="..." (the field inside its section).');
      return ctx;
    }
    if (collection) {
      if (collection.dynamic) return ctx;
      const allowed = RECORD_FIELDS[collection.value];
      if (!allowed) report(opening, `<CmsField collection="${collection.value}">: Storio edits records only for ${Object.keys(RECORD_FIELDS).join(', ')}.`);
      else if (!fieldPath.dynamic && !allowed.includes(fieldPath.value)) {
        report(opening, `<CmsField collection="${collection.value}" path="${fieldPath.value}">: Storio saves only ${allowed.join(', ')} of a ${collection.value}. Show other fields without <CmsField>.`);
      }
      if (!attr(opening, 'item')) report(opening, `<CmsField collection="${collection.value}"> needs item={...} (notice: its id; blog and event: their slug).`);
      return ctx;
    }

    const pageOverride = attrValue(opening, 'page');
    const sectionOverride = attrValue(opening, 'section');
    const page = pageOverride && !pageOverride.dynamic ? pageOverride.value : ctx.page ?? filePage;
    const section = sectionOverride && !sectionOverride.dynamic ? sectionOverride.value : pageOverride ? undefined : ctx.section;
    const entry = page && pages.get(page);
    if ((pageOverride?.dynamic || sectionOverride?.dynamic || ctx.unknown) && !sectionOverride?.value) return ctx;
    if (!entry) {
      if (!page) report(opening, `<CmsField path="${fieldPath.value ?? '...'}"> is outside any <CmsSection page={PAGE}>: the editor can't tell which page it belongs to.`);
      return ctx;
    }
    if (fieldPath.dynamic) {
      if (section) entry.dynamicSections.add(section);
      else entry.sectionKeys.forEach((s) => entry.dynamicSections.add(s));
      return ctx;
    }
    // Inside a helper component (outside the <CmsSection> in this file) the section is not known
    // here: the path must exist in one of the page's sections.
    const candidates = section ? [section] : entry.sectionKeys;
    const found = candidates.find((s) => hasPath(entry.content[s], fieldPath.value));
    if (found === undefined) {
      const where = section ? `section "${section}"` : 'any section';
      report(opening, `<CmsField path="${fieldPath.value}">: not in ${where} of src/content/${page}.json. Add a default there (then npm run editor:sync).`);
    } else {
      entry.usedPaths.add(`${found}.${fieldPath.template ? fieldPath.value.replace(/\.0(\.|$)/g, '.0$1') : fieldPath.value}`);
    }
    return ctx;
  }

  function checkThemeField(opening) {
    const field = attrValue(opening, 'field');
    const group = attrValue(opening, 'section')?.value ?? 'content';
    if (!field || field.dynamic) return;
    if (!themeFields.get(group)?.has(field.value)) {
      report(opening, `<ThemeField field="${field.value}">: add { "id": "${field.value}", ... } to customization.${group} in public/storio.template.json.`);
    }
  }

  visit(source, { page: undefined, section: undefined });
}

/** Demo data is Standalone-only and goes through withDemoFallback in src/lib (Rule 1). */
function checkDemoImports(file) {
  const text = fs.readFileSync(file, 'utf8');
  const r = rel(file);
  if (/from ['"]@\/data\/defaultDemoData['"]|DEFAULT_DEMO_DATA/.test(text)) {
    errors.push(`${r}  imports demo data. Load school data in src/lib with withDemoFallback (demo data shows only in Standalone).`);
  }
}

// ---------------------------------------------------------------- per page
function checkPages() {
  for (const entry of pages.values()) {
    const where = `editorPages "${entry.key}"`;
    const routeFile = routeFiles.get(entry.route);
    if (!routeFile) errors.push(`${where}: no route file for "${entry.route}" (src/app/(site)${entry.route === '/' ? '' : entry.route}/page.tsx).`);
    else if (!('collection' in entry) && !fs.readFileSync(routeFile, 'utf8').includes(`'${entry.key}'`)) {
      errors.push(`${rel(routeFile)}  needs generateMetadata() returning pageMetadata('${entry.key}') (the page's editable SEO).`);
    }
    if (!('collection' in entry) && !entry.sectionKeys.includes('seo')) {
      errors.push(`${where}: add a "seo" section (title, description, keywords, ogImage) to src/content/${entry.key}.json.`);
    }
    for (const section of entry.sectionKeys) {
      if (section === 'seo') continue;
      if (!entry.usedSections.has(section)) {
        errors.push(`${where}: section "${section}" has no <CmsSection sectionKey="${section}" page={PAGE}> in the code, so the editor can't open it.`);
        continue;
      }
      if (entry.dynamicSections.has(section)) continue;
      for (const leaf of leaves(entry.content[section])) {
        const key = leaf.split('.').pop();
        if (NOT_TEXT.test(key)) continue;
        if (![...entry.usedPaths].some((p) => p === `${section}.${leaf}` || p.startsWith(`${section}.${leaf}.`))) {
          warnings.push(`${where}: "${section}.${leaf}" has no <CmsField path="${leaf}"> (fine for a placeholder or aria-label: admins edit it in the section panel; otherwise wrap it so it gets a pencil).`);
        }
      }
    }
  }
}

// ---------------------------------------------------------------- helpers
function hasPath(value, dotted) {
  let current = value;
  for (const part of dotted.split('.')) {
    if (Array.isArray(current)) {
      if (current.length === 0) return true; // an empty list: nothing to check against
      current = current[Number(part)];
    } else if (current && typeof current === 'object' && part in current) current = current[part];
    else return false;
  }
  return current !== undefined;
}

/** "title", "items.0.title"... for every value of a section (lists checked through their first item). */
function leaves(value, prefix = '') {
  if (Array.isArray(value)) return value.length ? leaves(value[0], `${prefix}0.`) : [];
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => leaves(v, `${prefix}${k}.`));
  return prefix ? [prefix.slice(0, -1)] : [];
}

/** A {expression} rendered as a child (not an attribute value). */
function isJsxChild(node) {
  return ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent);
}

/** String literals a {expression} renders directly: 'x', a ? 'x' : 'y', a && 'x', a ?? 'x'. */
function literalsIn(e) {
  if (ts.isStringLiteralLike(e)) return [e];
  if (ts.isParenthesizedExpression(e)) return literalsIn(e.expression);
  if (ts.isConditionalExpression(e)) return [...literalsIn(e.whenTrue), ...literalsIn(e.whenFalse)];
  if (ts.isBinaryExpression(e) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(e.operatorToken.kind)) {
    return literalsIn(e.right);
  }
  return [];
}

function short(s) {
  const one = s.replace(/\s+/g, ' ');
  return one.length > 50 ? `${one.slice(0, 47)}...` : one;
}

// ---------------------------------------------------------------- result
if (warnings.length) console.log('check-pages notes (no pencil on the page):\n- ' + warnings.join('\n- '));
if (errors.length) {
  console.error(`check-pages found ${errors.length} problem(s). The Storio editor can't edit these:\n- ` + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log(`check-pages: ${pages.size} editor pages, ${codeFiles.length} files: every page is editable.`);
}
