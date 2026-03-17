/**
 * Admin App Bootstrap — Wires all modules together.
 * Mirrors the public site's app.js pattern.
 */
import { auth } from './utils/auth.js';
import { formatFullDate } from './utils/dom.js';

import { SidebarComponent } from './components/SidebarComponent.js';
import { DashboardView } from './views/DashboardView.js';
import { AlbumsView } from './views/AlbumsView.js';
import { AlbumDetailView } from './views/AlbumDetailView.js';
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

  const albums = new AlbumsView({
    tableContainer: 'albums-list-container'
  });

  const albumDetail = new AlbumDetailView('album-detail-container');

  // Add "Novo Álbum" button to section-album header if not present
  const albumHeader = document.querySelector('#section-album h2');
  if (albumHeader && !document.getElementById('btn-new-album')) {
    const btn = document.createElement('button');
    btn.id = 'btn-new-album';
    btn.className =
      'btn-primary flex items-center justify-center gap-2 mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-1';
    btn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      <span>Novo Álbum</span>
    `;
    const wrap = document.createElement('div');
    wrap.className = 'relative flex flex-col sm:flex-row sm:items-center justify-between mb-8';
    albumHeader.classList.remove('mb-8');
    albumHeader.parentNode.insertBefore(wrap, albumHeader);
    wrap.appendChild(albumHeader);
    wrap.appendChild(btn);
  }

  const tracks = new TracksView({
    tableContainer: null,
    formContainer: null
  });

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
    albums,
    albumDetail,
    tracks,
    users
  });

  controller.init();
});
