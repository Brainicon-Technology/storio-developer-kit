#!/usr/bin/env node
// Claude Code hook: keeps every page editable in the Storio dashboard editor, even when the agent
// didn't load the storio-page skill.
//
//   node .claude/hooks/storio-check.mjs post   (PostToolUse on Write/Edit) problems in the file just edited
//   node .claude/hooks/storio-check.mjs stop   (Stop) the whole template, when page files changed
//
// Exit code 2 sends the problems back to the agent, which fixes them before it finishes.
// Not part of the template: .storioignore keeps .claude/ out of `storio publish`.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2];
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const PAGE_FILES = /^(src\/(content|components|app)\/|public\/storio\.template\.json$)/;

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  // no input: run anyway
}

const rel = (p) => path.relative(root, path.resolve(root, p)).split(path.sep).join('/');
const run = (script, args = []) => spawnSync(process.execPath, [path.join(root, 'scripts', script), ...args], { cwd: root, encoding: 'utf8' });
const problems = (result) => (result.stderr || '').split(/\r?\n/).filter((l) => l.startsWith('- ')).map((l) => l.slice(2));

if (mode === 'post') {
  const file = input.tool_input?.file_path ? rel(input.tool_input.file_path) : '';
  if (/^src\/.*\.tsx$/.test(file)) {
    const own = problems(run('check-pages.mjs')).filter((p) => p.startsWith(`${file}:`) || p.startsWith(`${file} `));
    if (own.length) {
      process.stderr.write(`Storio editor rules (storio-page skill) broken in ${file}:\n- ${own.join('\n- ')}\n`);
      process.exitCode = 2;
    }
  }
} else if (mode === 'stop') {
  const git = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' });
  const changed = (git.stdout || '').split(/\r?\n/).map((l) => l.slice(3).replace(/^.* -> /, '').replace(/^"|"$/g, '')).filter((f) => PAGE_FILES.test(f));
  if (changed.length) {
    const found = [...problems(run('storio-editor-sync.mjs', ['--check'])), ...problems(run('check-pages.mjs'))];
    if (found.length) {
      process.stderr.write(
        `The Storio editor can't edit this template yet (npm run storio:check). Fix these before finishing (see .claude/skills/storio-page/SKILL.md):\n- ${found.join('\n- ')}\n`,
      );
      // Ask once: if the agent is already continuing because of this hook, report without blocking again.
      if (!input.stop_hook_active) process.exitCode = 2;
    }
  }
}
