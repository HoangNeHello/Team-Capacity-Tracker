// api/client.js: every fetch call in the app goes through this file.
import ApiError from './ApiError.js';
import * as mock from './mock.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const TOKEN_KEY = 'tct.token';

let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request(path, { body, headers, ...options } = {}) {
  const token = readToken();
  const allHeaders = { ...headers };
  if (body !== undefined) allHeaders['Content-Type'] = 'application/json';
  if (token) allHeaders.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: allHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data?.error || `${res.status} ${res.statusText}`);
  }
  return data;
}

const real = {
  getHealth: () => request('/api/health'),

  signup: (email, password) => request('/api/auth/signup', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),

  getTeams: () => request('/api/teams'),
  createTeam: (name) => request('/api/teams', { method: 'POST', body: { name } }),
  getTeam: (teamId) => request(`/api/teams/${teamId}`),

  getMembers: (teamId) => request(`/api/teams/${teamId}/members`),
  createMember: (teamId, member) => request(`/api/teams/${teamId}/members`, { method: 'POST', body: member }),
  updateMember: (teamId, id, member) =>
    request(`/api/teams/${teamId}/members/${id}`, { method: 'PUT', body: member }),
  deleteMember: (teamId, id) => request(`/api/teams/${teamId}/members/${id}`, { method: 'DELETE' }),

  getTasks: (teamId) => request(`/api/teams/${teamId}/tasks`),
  createTask: (teamId, task) => request(`/api/teams/${teamId}/tasks`, { method: 'POST', body: task }),
  updateTask: (teamId, id, task) => request(`/api/teams/${teamId}/tasks/${id}`, { method: 'PUT', body: task }),
  deleteTask: (teamId, id) => request(`/api/teams/${teamId}/tasks/${id}`, { method: 'DELETE' }),

  getWorkload: (teamId) => request(`/api/teams/${teamId}/workload`),
};

// Mock switch: VITE_USE_MOCK=true uses the temporary fake API in mock.js.
const api = import.meta.env.VITE_USE_MOCK === 'true' ? mock : real;

export const {
  getHealth,
  signup,
  login,
  getTeams,
  createTeam,
  getTeam,
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getWorkload,
} = api;
