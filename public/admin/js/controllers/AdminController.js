/**
 * AdminController — Orchestrates state, API, and views.
 * Follows the same pattern as the public site's AppController.
 */
import { AdminState } from '../state/AdminState.js';
import { adminService } from '../api/adminService.js';
import { auth } from '../utils/auth.js';
import { toast } from '../components/ToastComponent.js';
import { confirmDialog } from '../components/ConfirmDialog.js';

export class AdminController {
  /**
   * @param {Object} views
   * @param {import('../components/SidebarComponent.js').SidebarComponent} views.sidebar
   * @param {import('../views/DashboardView.js').DashboardView} views.dashboard
   * @param {import('../views/AlbumView.js').AlbumView} views.album
   * @param {import('../views/TracksView.js').TracksView} views.tracks
   * @param {import('../views/UsersView.js').UsersView} views.users
   */
  constructor(views) {
    this.views = views;
    this._bindState();
    this._bindViews();
  }

  // ── State subscriptions ────────────────────────────────────────────
  _bindState() {
    AdminState.subscribe('currentSection', (section) => {
      this._showSection(section);
    });
  }

  // ── View event wiring ─────────────────────────────────────────────
  _bindViews() {
    const { sidebar, album, tracks, users } = this.views;

    // Sidebar
    sidebar.onNavigate = (section) => {
      AdminState.set('currentSection', section);
    };
    sidebar.onLogout = () => auth.logout();

    // Album
    album.onSave = async (data) => {
      try {
        await adminService.updateAlbum(data);
        toast.success('Álbum atualizado!');
      } catch (e) {
        toast.error(e.message || 'Erro ao salvar álbum');
      }
    };

    // Tracks
    tracks.onSave = async (data, id) => {
      try {
        if (id) {
          await adminService.updateTrack(id, data);
          toast.success('Faixa atualizada!');
        } else {
          await adminService.createTrack(data);
          toast.success('Faixa criada!');
        }
        tracks.closeForm();
        await this._loadTracks();
      } catch (e) {
        tracks.showFormError(e.message || 'Erro ao salvar.');
      }
    };

    tracks.onEdit = async (id) => {
      try {
        const track = await adminService.getTrack(id);
        tracks.openEditForm(track);
      } catch (e) {
        toast.error('Erro ao carregar faixa');
      }
    };

    tracks.onDelete = async (id, title) => {
      const ok = await confirmDialog.show({
        title: 'Excluir Faixa',
        message: `Deseja excluir a faixa "${title}"? Essa ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      });
      if (!ok) return;
      try {
        await adminService.deleteTrack(id);
        toast.success(`Faixa "${title}" excluída!`);
        await this._loadTracks();
      } catch (e) {
        toast.error('Erro ao excluir faixa');
      }
    };

    // Users
    users.onSave = async (data) => {
      try {
        await adminService.createUser(data);
        toast.success('Usuário criado!');
        users.resetForm();
        await this._loadUsers();
      } catch (e) {
        users.showFormError(e.message || 'Erro ao criar usuário.');
      }
    };

    users.onDelete = async (id, username) => {
      const ok = await confirmDialog.show({
        title: 'Excluir Admin',
        message: `Deseja excluir o admin "${username}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      });
      if (!ok) return;
      try {
        await adminService.deleteUser(id);
        toast.success(`Admin "${username}" removido!`);
        await this._loadUsers();
      } catch (e) {
        toast.error('Erro ao excluir usuário');
      }
    };
  }

  // ── Init ───────────────────────────────────────────────────────────
  async init() {
    this._showSection('dashboard');
    this.views.sidebar.setActive('dashboard');
    await this._loadDashboard();
  }

  // ── Section routing ────────────────────────────────────────────────
  _showSection(name) {
    // Toggle visibility
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(`section-${name}`);
    if (section) section.classList.add('active');

    // Update sidebar
    this.views.sidebar.setActive(name);

    // Load data for section
    switch (name) {
      case 'dashboard': this._loadDashboard(); break;
      case 'album': this._loadAlbum(); break;
      case 'tracks': this._loadTracks(); break;
      case 'users': this._loadUsers(); break;
    }
  }

  // ── Data loaders ───────────────────────────────────────────────────
  async _loadDashboard() {
    try {
      const tracks = await adminService.getTracks();
      AdminState.set('tracks', tracks);
      this.views.dashboard.render(tracks);
    } catch (e) {
      toast.error('Erro ao carregar dashboard');
    }
  }

  async _loadAlbum() {
    try {
      const data = await adminService.getAlbum();
      AdminState.set('album', data);
      this.views.album.setValues(data);
    } catch (e) {
      toast.error('Erro ao carregar álbum');
    }
  }

  async _loadTracks() {
    this.views.tracks.setTableLoading(true);
    try {
      const tracks = await adminService.getTracks();
      AdminState.set('tracks', tracks);
      this.views.tracks.setTableData(tracks);
    } catch (e) {
      toast.error('Erro ao carregar faixas');
      this.views.tracks.setTableData([]);
    }
  }

  async _loadUsers() {
    this.views.users.setTableLoading(true);
    try {
      const users = await adminService.getUsers();
      AdminState.set('users', users);
      this.views.users.setTableData(users);
    } catch (e) {
      toast.error('Erro ao carregar usuários');
      this.views.users.setTableData([]);
    }
  }
}
