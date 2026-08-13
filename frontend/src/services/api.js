import { getToken, clearToken } from './token';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(status, detail) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, formBody, auth = true } = options;

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (formBody !== undefined) headers['Content-Type'] = 'application/x-www-form-urlencoded';

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : formBody,
  });

  if (res.status === 204) return undefined;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let detail = 'Something went wrong';
    if (data && typeof data === 'object' && 'detail' in data) {
      const d = data.detail;
      if (typeof d === 'string') detail = d;
      else if (Array.isArray(d)) detail = d.map((x) => (typeof x === 'object' && x && 'msg' in x ? x.msg : String(x))).join(', ');
      else detail = JSON.stringify(d);
    } else if (typeof data === 'string') {
      detail = data;
    }

    if (res.status === 401) {
      clearToken();
      window.location.href = '/login';
      throw new ApiError(401, 'Session expired. Please log in again.');
    }

    throw new ApiError(res.status, detail);
  }

  return data;
}

export default request;
