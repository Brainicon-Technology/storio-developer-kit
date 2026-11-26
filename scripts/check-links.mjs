#!/usr/bin/env node
// Finds broken links: starts at the home page, follows every internal link (menus, cards, buttons)
// and lists each page that does not answer 200, with the page that links to it.
//
//   npm run dev                      (or npm run build && npm start)
//   npm run check:links              checks http://localhost:3000
//   npm run check:links -- http://localhost:3001
//
// Run it twice: in Standalone Preview (demo data) and after `storio link` (a real school's data).
const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const status = new Map(); // path -> HTTP status
const linkedFrom = new Map(); // path -> first page that links to it
const queue = ['/'];

const isPage = (href) =>
  href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/_next') && !/\.(svg|png|jpe?g|webp|gif|ico|css|js|pdf|xml|txt)$/i.test(href);

async function main() {
  while (queue.length > 0) {
    const path = queue.shift();
    if (status.has(path)) continue;
    let html = '';
    try {
      // Redirects (old menu URLs) count as fine when they end on a working page.
      const res = await fetch(base + path, { redirect: 'follow' });
      status.set(path, res.status);
      if (res.ok && (res.headers.get('content-type') ?? '').includes('text/html')) html = await res.text();
    } catch {
      status.set(path, 'no answer');
      if (path === '/') {
        console.error(`check-links: ${base} does not answer. Start the site first (npm run dev).`);
        process.exitCode = 1;
        return;
      }
    }
    for (const match of html.matchAll(/href="([^"#]*)/g)) {
      const href = match[1].replace(/&amp;/g, '&');
      if (!isPage(href) || status.has(href) || queue.includes(href)) continue;
      queue.push(href);
      if (!linkedFrom.has(href)) linkedFrom.set(href, path);
    }
  }

  const broken = [...status].filter(([, code]) => code !== 200);
  console.log(`check-links: ${status.size} page(s) checked on ${base}, ${broken.length} broken.`);
  for (const [path, code] of broken) console.log(`  ${code}  ${path}   (linked from ${linkedFrom.get(path) ?? 'start'})`);
  // Never end with an exit call: Storio's publish security scan refuses it.
  if (broken.length > 0) process.exitCode = 1;
}

await main();
