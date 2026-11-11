// Serves a checkout read-only on a free local port for the lifetime of a script (topology-snapshot.mjs, topology-sheet.mjs).
// The test pages load their test font, which browsers refuse from file:// URLs.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2' };

export const serveRepo = async (dir) => {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    let file;
    try { file = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://x').pathname)}`); } catch { res.writeHead(400).end(); return; }
    let ok = false;
    try { ok = file.startsWith(`${root}${sep}`) && statSync(file).isFile(); } catch { ok = false; }
    if (!ok) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
};
