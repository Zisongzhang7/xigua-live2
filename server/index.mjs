import http from 'node:http';
import { URL } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import { deleteNote, exportProject, listNotes, bulkUpsertNotes } from './storage.mjs';

const PORT = Number(process.env.PORT || 5175);
const HOST = process.env.HOST || '0.0.0.0';
const SERVE_STATIC = process.env.SERVE_STATIC === '1'; // docker: serve dist
const DIST_DIR = path.resolve(process.cwd(), 'dist');

function send(res, code, data, headers = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(code, {
    'content-type': typeof data === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type',
    ...headers
  });
  res.end(body);
}

async function readBodyJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return null;
  return JSON.parse(raw);
}

function validateProjectId(p) {
  if (!p || typeof p !== 'string') return 'default';
  return p.slice(0, 80);
}

function validateNotesArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((n) => n && typeof n.key === 'string' && typeof n.scopeKey === 'string' && typeof n.selector === 'string' && typeof n.content === 'string')
    .map((n) => ({
      key: n.key,
      scopeKey: n.scopeKey,
      selector: n.selector,
      content: n.content,
      createdAt: typeof n.createdAt === 'string' ? n.createdAt : new Date().toISOString(),
      updatedAt: typeof n.updatedAt === 'string' ? n.updatedAt : new Date().toISOString()
    }));
}

async function serveStatic(reqUrl, res) {
  // SPA fallback: / -> index.html
  const pathname = reqUrl.pathname === '/' ? '/index.html' : reqUrl.pathname;
  const filePath = path.join(DIST_DIR, pathname);
  if (!filePath.startsWith(DIST_DIR)) return false;
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) return false;
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const ct =
      ext === '.html' ? 'text/html; charset=utf-8' :
        ext === '.js' ? 'application/javascript; charset=utf-8' :
          ext === '.css' ? 'text/css; charset=utf-8' :
            ext === '.svg' ? 'image/svg+xml' :
              ext === '.png' ? 'image/png' :
                ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                  'application/octet-stream';
    res.writeHead(200, { 'content-type': ct });
    res.end(data);
    return true;
  } catch {
    // fallback to index.html for SPA routes
    try {
      const html = await fs.readFile(path.join(DIST_DIR, 'index.html'));
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(html);
      return true;
    } catch {
      return false;
    }
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') return send(res, 204, '');

  // API
  if (reqUrl.pathname === '/api/health') {
    return send(res, 200, { ok: true, time: new Date().toISOString() });
  }

  if (reqUrl.pathname === '/api/prd-notes' && req.method === 'GET') {
    const projectId = validateProjectId(reqUrl.searchParams.get('projectId'));
    const scopeKey = reqUrl.searchParams.get('scopeKey') || undefined;
    const notes = await listNotes({ projectId, scopeKey });
    return send(res, 200, { notes });
  }

  if (reqUrl.pathname === '/api/prd-notes' && (req.method === 'PUT' || req.method === 'POST')) {
    try {
      const json = await readBodyJson(req);
      const projectId = validateProjectId(json?.projectId);
      const notes = validateNotesArray(json?.notes);
      await bulkUpsertNotes({ projectId, notes });
      return send(res, 200, { ok: true, count: notes.length });
    } catch (e) {
      return send(res, 400, { ok: false, error: String(e?.message || e) });
    }
  }

  if (reqUrl.pathname === '/api/prd-notes' && req.method === 'DELETE') {
    const projectId = validateProjectId(reqUrl.searchParams.get('projectId'));
    const key = reqUrl.searchParams.get('key');
    if (!key) return send(res, 400, { ok: false, error: 'missing key' });
    await deleteNote({ projectId, key });
    return send(res, 200, { ok: true });
  }

  if (reqUrl.pathname === '/api/prd-notes/export' && req.method === 'GET') {
    const projectId = validateProjectId(reqUrl.searchParams.get('projectId'));
    const payload = await exportProject({ projectId });
    return send(res, 200, payload);
  }

  // Static
  if (SERVE_STATIC) {
    const ok = await serveStatic(reqUrl, res);
    if (ok) return;
  }

  return send(res, 404, { ok: false, error: 'not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`[prd-sync] server listening on http://${HOST}:${PORT} (serveStatic=${SERVE_STATIC})`);
});


