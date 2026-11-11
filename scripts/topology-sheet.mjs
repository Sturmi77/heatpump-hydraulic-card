// Contact sheet of a drawing baseline change (#395): pictures of the cases whose fingerprint in test/topology-snapshot.js differs
// from another git revision, before and after, side by side in one HTML page.
//
//   node scripts/topology-sheet.mjs --base origin/main [--out topology-sheet] [--max 40]
//
// "Before" is drawn from the base revision (extracted with git archive into a temporary folder), "after" from the working tree.
// Cases whose geometry changed come first, then cases whose state changed only, then new cases. Runs in Chromium. The CI job
// "Drawing changes" uploads the folder as an artifact when a pull request changes the baseline. Writes a short Markdown summary
// to stdout.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { serveRepo } from './repo-server.mjs';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => { const n = args.indexOf(`--${name}`); return n >= 0 ? args[n + 1] : fallback; };
const baseRef = opt('base');
const out = resolve(opt('out', join(root, 'topology-sheet')));
const max = Number(opt('max', 40));
if (!baseRef) { console.error('usage: topology-sheet.mjs --base <git revision> [--out <folder>] [--max <cases>]'); process.exit(2); }

const parse = (text) => {
  const cases = {};
  for (const m of text.matchAll(/^\s*("(?:[^"\\]|\\.)*"): "([0-9a-f]{8}) ([0-9a-f]{8})",$/gm)) cases[JSON.parse(m[1])] = { geo: m[2], state: m[3] };
  return cases;
};
const git = (...a) => execFileSync('git', ['-C', root, ...a], { maxBuffer: 1 << 28 });
const before = parse(git('show', `${baseRef}:test/topology-snapshot.js`).toString('utf8'));
const after = parse(readFileSync(join(root, 'test/topology-snapshot.js'), 'utf8'));

const changed = Object.keys(after).filter((key) => !before[key] || before[key].geo !== after[key].geo || before[key].state !== after[key].state)
  .map((key) => ({ key, kind: !before[key] ? 'new' : before[key].geo !== after[key].geo ? 'geometry' : 'state' }));
const gone = Object.keys(before).filter((key) => !after[key]);
const order = { geometry: 0, state: 1, new: 2 };
changed.sort((a, b) => order[a.kind] - order[b.kind]);
// One case per group first (demo setup or storage strategy), so a change that touches hundreds of cases still
// shows its variety; then the rest in order.
const groupOf = (key) => key.split(' ').slice(0, 2).join(' ');
const seen = new Set(); const first = []; const rest = [];
for (const c of changed) {
  (seen.has(groupOf(c.key)) ? rest : first).push(c);
  seen.add(groupOf(c.key));
}
const shown = [...first, ...rest].slice(0, max);

const counts = Object.fromEntries(Object.keys(order).map((k) => [k, changed.filter((c) => c.kind === k).length]));
const summary = `Drawing baseline against ${baseRef}: ${counts.geometry} cases with changed geometry, ${counts.state} with changed state only, ${counts.new} new, ${gone.length} removed; ${shown.length} shown.`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
if (!shown.length) {
  writeFileSync(join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Drawing changes</title><p>${summary}</p>`);
  console.log(summary);
  process.exit(0);
}

const tmp = mkdtempSync(join(tmpdir(), 'hfc-sheet-'));
try {
  writeFileSync(join(tmp, 'base.tar'), git('archive', '--format=tar', baseRef, 'dist', 'demo', 'test'));
  execFileSync('tar', ['-xf', 'base.tar'], { cwd: tmp });
  const playwright = await import('playwright');
  const browser = await playwright.chromium.launch({ executablePath: process.env.HFC_CHROMIUM || undefined });
  const servers = { before: await serveRepo(tmp), after: await serveRepo(root) };
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
    for (const [n, c] of shown.entries()) {
      for (const side of ['before', 'after']) {
        if (side === 'before' && c.kind === 'new') continue;
        await page.goto(`${servers[side].url}/test/topology.html?only=${encodeURIComponent(`^${escape(c.key)}$`)}`);
        await page.waitForFunction(() => /^(PASS|FAIL)/.test(document.title), null, { timeout: 120_000 });
        const card = await page.$('#stage heatpump-flow-card');
        if (card) await card.screenshot({ path: join(out, `${n}-${side}.png`) });
        else c[`${side}Missing`] = true;
      }
    }
  } finally {
    await browser.close();
    servers.before.close(); servers.after.close();
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const img = (n, side, c) => (c.kind === 'new' && side === 'before' ? '<p>new case</p>' : c[`${side}Missing`] ? '<p>not drawn</p>' : `<img src="${n}-${side}.png" alt="${side}">`);
const rows = shown.map((c, n) => `<tr><th colspan="2">${esc(c.key)} <span>${c.kind}</span></th></tr><tr><td>${img(n, 'before', c)}</td><td>${img(n, 'after', c)}</td></tr>`).join('\n');
writeFileSync(join(out, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Drawing changes</title>
<style>body { font: 14px system-ui, sans-serif; margin: 16px; } table { border-collapse: collapse; width: 100%; } th { text-align: left; padding: 12px 4px 4px; }
th span { font-weight: normal; color: #666; } td { vertical-align: top; width: 50%; padding: 4px; border-bottom: 1px solid #ddd; } img { max-width: 100%; }</style></head>
<body><h1>Drawing changes</h1><p>${esc(summary)}</p>${gone.length ? `<p>Removed: ${gone.map(esc).join(', ')}</p>` : ''}
<table><tr><th>Before (${esc(baseRef)})</th><th>After (this change)</th></tr>
${rows}
</table></body></html>
`);
console.log(summary);
