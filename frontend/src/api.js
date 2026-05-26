const ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function hit(path, opts = {}) {
  const res = await fetch(`${ROOT}/bfhl${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
  return payload;
}

export const getTasks = (filters = {}) => {
  const q = new URLSearchParams();
  if (filters.status && filters.status !== 'all') q.set('status', filters.status);
  if (Number(filters.minImportance) > 1) q.set('minImportance', filters.minImportance);
  const qs = q.toString();
  return hit(`/tasks${qs ? `?${qs}` : ''}`);
};

export const createTask = (body) =>
  hit('/tasks', { method: 'POST', body: JSON.stringify(body) });

export const patchTask = (id, body) =>
  hit(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const dropTask = (id) =>
  hit(`/tasks/${id}`, { method: 'DELETE' });

export const getStats = () => hit('/tasks/stats');
