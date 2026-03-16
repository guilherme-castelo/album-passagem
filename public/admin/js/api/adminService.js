/**
 * AdminService — Centralized API layer for all admin CRUD operations.
 */
import { auth } from '../utils/auth.js';

function getBaseUrl() {
  return window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
}

async function request(url, options = {}) {
  const res = await fetch(`${getBaseUrl()}${url}`, {
    ...options,
    headers: auth.headers()
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const adminService = {
  // ── Auth ─────────────────────────────────────────────
  async login(username, password) {
    const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciais inválidas.');
    return data;
  },

  // ── Album ────────────────────────────────────────────
  getAlbum() {
    return request('/api/album');
  },

  updateAlbum(albumData) {
    return request('/api/album', {
      method: 'PUT',
      body: JSON.stringify(albumData)
    });
  },

  // ── Tracks ───────────────────────────────────────────
  getTracks() {
    return request('/api/tracks');
  },

  getTrack(id) {
    return request(`/api/tracks/${id}`);
  },

  createTrack(trackData) {
    return request('/api/tracks', {
      method: 'POST',
      body: JSON.stringify(trackData)
    });
  },

  updateTrack(id, trackData) {
    return request(`/api/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trackData)
    });
  },

  deleteTrack(id) {
    return request(`/api/tracks/${id}`, { method: 'DELETE' });
  },

  // ── Users ────────────────────────────────────────────
  getUsers() {
    return request('/api/users');
  },

  createUser(userData) {
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser(id, userData) {
    return request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser(id) {
    return request(`/api/users/${id}`, { method: 'DELETE' });
  }
};
