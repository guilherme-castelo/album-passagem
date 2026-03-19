/**
 * AdminService — Centralized API layer for all admin CRUD operations.
 */
import { auth } from '../utils/auth.js';
import { toast } from '../components/ToastComponent.js';

function getBaseUrl() {
  return window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location;
}

async function request(url, options = {}) {
  const res = await fetch(`${getBaseUrl()}${url}`, {
    ...options,
    headers: auth.headers()
  });
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      toast.error('Sessão expirada. Faça login novamente.', 3000);
      setTimeout(() => auth.logout(), 2500);
      throw new Error('Sessão expirada');
    }
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

  // ─── Albums ─────────────────────────────────────────────
  getAlbums() {
    return request('/api/album');
  },

  getAlbum(id) {
    return request(`/api/album/${id}`);
  },

  createAlbum(albumData) {
    return request('/api/album', {
      method: 'POST',
      body: JSON.stringify(albumData)
    });
  },

  updateAlbum(id, albumData) {
    return request(`/api/album/${id}`, {
      method: 'PUT',
      body: JSON.stringify(albumData)
    });
  },

  deleteAlbum(id) {
    return request(`/api/album/${id}`, { method: 'DELETE' });
  },

  // ─── Tracks (contextual or global) ──────────────────────
  getTracks(albumId) {
    if (!albumId) throw new Error('albumId é obrigatório para listar faixas');
    return request(`/api/album/${albumId}/tracks`);
  },

  getTrack(trackId) {
    return request(`/api/tracks/${trackId}`);
  },

  createTrack(data, albumId) {
    return request(`/api/album/${albumId}/tracks`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateTrack(trackId, data) {
    return request(`/api/tracks/${trackId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteTrack(trackId) {
    return request(`/api/tracks/${trackId}`, {
      method: 'DELETE'
    });
  },

  reorderTracks(albumId, trackIds) {
    return request(`/api/album/${albumId}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ trackIds })
    });
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
  },

  // ── Analytics ────────────────────────────────────────
  getDashboardAnalytics() {
    return request('/api/analytics/dashboard');
  },

  getTrackAnalytics() {
    return request('/api/analytics/tracks');
  }
};
