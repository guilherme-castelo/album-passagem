/**
 * Admin App Bootstrap — Wires all modules together.
 * Mirrors the public site's app.js pattern.
 */
import { auth } from './utils/auth.js';
import { formatFullDate } from './utils/dom.js';

import { SidebarComponent } from './components/SidebarComponent.js';
import { DashboardView } from './views/DashboardView.js';
import { AlbumView } from './views/AlbumView.js';
import { TracksView } from './views/TracksView.js';
import { UsersView } from './views/UsersView.js';
import { AdminController } from './controllers/AdminController.js';

// ── Auth Guard ─────────────────────────────────────────────────────────
if (!auth.guard()) {
  // guard() redirects, but we stop execution here just in case.
  throw new Error('Unauthenticated');
}

document.addEventListener('DOMContentLoaded', () => {
  // ── Set date ───────────────────────────────────────────────────────
  const dateEl = document.getElementById('current-date');
  if (dateEl) dateEl.textContent = formatFullDate();

  // ── Mobile hamburger ───────────────────────────────────────────────
  const hamburgerBtn = document.getElementById('btn-hamburger');

  // ── Instantiate Views ──────────────────────────────────────────────
  const sidebar = new SidebarComponent({
    sidebar: 'admin-sidebar',
    overlay: 'mobile-overlay',
    username: 'admin-username'
  });

  // Connect hamburger to sidebar
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => sidebar.toggle());
  }

  const dashboard = new DashboardView('dashboard-content');

  const album = new AlbumView('album-content');

  const tracks = new TracksView({
    tableContainer: 'tracks-table-container',
    formContainer: 'tracks-form-container'
  });

  // Wire the "Nova Faixa" button
  const btnNewTrack = document.getElementById('btn-new-track');
  if (btnNewTrack) {
    btnNewTrack.addEventListener('click', () => tracks.openNewForm());
  }

  const users = new UsersView({
    tableContainer: 'users-table-container',
    formContainer: 'users-form-container'
  });

  // Wire the "Novo Usuário" button
  const btnNewUser = document.getElementById('btn-new-user');
  if (btnNewUser) {
    btnNewUser.addEventListener('click', () => users.toggleForm());
  }

  // ── Controller ─────────────────────────────────────────────────────
  const controller = new AdminController({
    sidebar,
    dashboard,
    album,
    tracks,
    users
  });

  controller.init();
});
