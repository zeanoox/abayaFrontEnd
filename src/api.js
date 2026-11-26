// Thin client for the LORIM backend API.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const API_ORIGIN = API_URL.replace(/\/api$/, '');

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed (${status})`);
    this.status = status;
    this.code = body?.error || 'NETWORK';
    this.body = body || {};
  }
}

export async function api(path, { method = 'GET', body, cartToken, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cartToken) headers['X-Cart-Token'] = cartToken;
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, { error: 'NETWORK', message: 'Cannot reach the shop server' });
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

/** Image paths from the API are relative to the API host. */
export const img = (url) => (!url ? '' : /^https?:/.test(url) ? url : `${API_ORIGIN}${url}`);

export const qs = (params) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return;
    s.set(k, Array.isArray(v) ? v.join(',') : String(v));
  });
  const out = s.toString();
  return out ? `?${out}` : '';
};
