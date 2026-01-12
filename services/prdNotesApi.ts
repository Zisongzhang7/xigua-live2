import type { PrdNote } from '../types';

const DEFAULT_PROJECT_ID = 'livev2';

function getProjectId(): string {
  const env = (import.meta as any)?.env;
  const id = env?.VITE_PRD_PROJECT_ID;
  if (typeof id === 'string' && id.trim()) return id.trim();
  return DEFAULT_PROJECT_ID;
}

export function prdProjectId() {
  return getProjectId();
}

export async function prdApiHealth(): Promise<boolean> {
  try {
    const r = await fetch('/api/health', { method: 'GET' });
    return r.ok;
  } catch {
    return false;
  }
}

export async function fetchPrdNotes(scopeKey: string): Promise<PrdNote[]> {
  const projectId = getProjectId();
  const url = `/api/prd-notes?projectId=${encodeURIComponent(projectId)}&scopeKey=${encodeURIComponent(scopeKey)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetchPrdNotes failed: ${r.status}`);
  const json = await r.json();
  return Array.isArray(json?.notes) ? json.notes : [];
}

export async function upsertPrdNotes(notes: PrdNote[]): Promise<void> {
  const projectId = getProjectId();
  const r = await fetch('/api/prd-notes', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ projectId, notes })
  });
  if (!r.ok) throw new Error(`upsertPrdNotes failed: ${r.status}`);
}

export async function deletePrdNote(key: string): Promise<void> {
  const projectId = getProjectId();
  const url = `/api/prd-notes?projectId=${encodeURIComponent(projectId)}&key=${encodeURIComponent(key)}`;
  const r = await fetch(url, { method: 'DELETE' });
  if (!r.ok) throw new Error(`deletePrdNote failed: ${r.status}`);
}

export async function exportPrdNotesFromServer(): Promise<any> {
  const projectId = getProjectId();
  const url = `/api/prd-notes/export?projectId=${encodeURIComponent(projectId)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`export failed: ${r.status}`);
  return await r.json();
}


