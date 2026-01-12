import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'prd-notes.json');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonSafe() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { version: 1, projects: {} };
  }
}

async function writeJsonAtomic(obj) {
  await ensureDir();
  const tmp = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf8');
  await fs.rename(tmp, DATA_FILE);
}

export async function listNotes({ projectId, scopeKey }) {
  const db = await readJsonSafe();
  const proj = db.projects?.[projectId];
  const all = proj?.notes ? Object.values(proj.notes) : [];
  if (!scopeKey) return all;
  return all.filter((n) => n.scopeKey === scopeKey);
}

export async function bulkUpsertNotes({ projectId, notes }) {
  const db = await readJsonSafe();
  db.projects ||= {};
  db.projects[projectId] ||= { notes: {} };
  db.projects[projectId].notes ||= {};

  for (const n of notes) {
    if (!n || typeof n.key !== 'string') continue;
    db.projects[projectId].notes[n.key] = n;
  }
  await writeJsonAtomic(db);
}

export async function deleteNote({ projectId, key }) {
  const db = await readJsonSafe();
  if (db.projects?.[projectId]?.notes?.[key]) {
    delete db.projects[projectId].notes[key];
    await writeJsonAtomic(db);
  }
}

export async function exportProject({ projectId }) {
  const notes = await listNotes({ projectId, scopeKey: undefined });
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    projectId,
    notes
  };
}


