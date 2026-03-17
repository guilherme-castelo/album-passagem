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
   * @param {import('../views/AlbumsView.js').AlbumsView} views.albums
   * @param {import('../views/AlbumDetailView.js').AlbumDetailView} views.albumDetail
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
    const { sidebar, albums, albumDetail, tracks, users } = this.views;

    // Sidebar
    sidebar.onNavigate = (section) => {
      AdminState.set('currentSection', section);
      AdminState.set('selectedAlbum', null); // Reset context when moving between top sections
    };
    sidebar.onLogout = () => auth.logout();

    // Albums List
    albums.onView = async (id) => {
      await this._openAlbumHub(id);
    };

    albums.onSave = async (data, id) => {
      try {
        if (id) {
          await adminService.updateAlbum(id, data);
          toast.success('Álbum atualizado!');
        } else {
          await adminService.createAlbum(data);
          toast.success('Álbum criado!');
        }
        albums.closeModal();
        await this._loadAlbums();
      } catch (e) {
        albums.showFormError(e.message || 'Erro ao salvar álbum');
      }
    };

    albums.onDelete = async (id, title) => {
      const ok = await confirmDialog.show({
        title: 'Excluir Álbum',
        message: `Deseja excluir o álbum "${title}"? Todas as músicas vinculadas serão apagadas!`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      });
      if (!ok) return;
      try {
        await adminService.deleteAlbum(id);
        toast.success(`Álbum "${title}" excluído!`);
        await this._loadAlbums();
      } catch (e) {
        toast.error('Erro ao excluir álbum');
      }
    };

    const btnNewAlbum = document.getElementById('btn-new-album');
    if (btnNewAlbum) btnNewAlbum.addEventListener('click', () => albums.openNewForm());

    // Album Detail (Hub)
    albumDetail.onBack = () => {
      AdminState.set('selectedAlbum', null);
      this._loadAlbums();
    };

    albumDetail.onEditAlbum = (album) => {
      albums.openEditForm(album);
    };

    albumDetail.onAddTrack = () => {
      const album = AdminState.get('selectedAlbum');
      tracks.setAlbums(AdminState.get('albums'), album._id);
      tracks.openNewForm();
    };

    albumDetail.onEditTrack = async (_id) => {
      try {
        const track = await adminService.getTrack(_id);
        const albums = AdminState.get('albums');
        tracks.setAlbums(albums, track.albumId);
        tracks.openEditForm(track);
      } catch (e) {
        toast.error('Erro ao carregar faixa');
      }
    };

    albumDetail.onDeleteTrack = async (_id, title) => {
      const ok = await confirmDialog.show({
        title: 'Excluir Faixa',
        message: `Deseja excluir a faixa "${title}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      });
      if (!ok) return;
      try {
        await adminService.deleteTrack(_id);
        toast.success(`Faixa "${title}" excluída!`);
        await this._refreshAlbumHub();
      } catch (e) {
        toast.error('Erro ao excluir faixa');
      }
    };

    albumDetail.onSaveTheme = async (config) => {
      const album = AdminState.get('selectedAlbum');
      if (!album) return;
      try {
        const payload = config === 'RESET' ? { uiConfig: null } : { uiConfig: config };
        await adminService.updateAlbum(album._id, payload);
        toast.success(
          config === 'RESET' ? 'Tema resetado para padrões!' : 'Tema salvo com sucesso!'
        );
        await this._refreshAlbumHub();
      } catch (e) {
        toast.error('Erro ao salvar tema');
      }
    };

    albumDetail.onReorder = async (trackIds) => {
      const album = AdminState.get('selectedAlbum');
      if (!album) return;
      try {
        await adminService.reorderTracks(album._id, trackIds);
        toast.success('Ordem salva!');
      } catch (e) {
        toast.error('Erro ao salvar ordem');
        await this._refreshAlbumHub(); // Rollback local UI
      }
    };

    // Tracks (Global logic removed, now only used via Hub)
    tracks.onSave = async (data, _id) => {
      try {
        const selected = AdminState.get('selectedAlbum');
        if (_id) {
          await adminService.updateTrack(_id, data);
          toast.success('Faixa atualizada!');
        } else {
          await adminService.createTrack(data, selected ? selected._id : data.albumId);
          toast.success('Faixa criada!');
        }
        tracks.closeForm();

        if (selected) {
          await this._refreshAlbumHub();
        }
      } catch (e) {
        tracks.showFormError(e.message || 'Erro ao salvar.');
      }
    };

    // Users
    users.onSave = async (data, _id) => {
      try {
        if (_id) {
          await adminService.updateUser(_id, data);
          toast.success('Usuário atualizado!');
        } else {
          await adminService.createUser(data);
          toast.success('Usuário criado!');
        }
        users.closeModal();
        await this._loadUsers();
      } catch (e) {
        users.showFormError(e.message || 'Erro ao salvar usuário.');
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
    // Pre-load albums for global selects
    try {
      const albums = await adminService.getAlbums();
      AdminState.set('albums', albums);
    } catch (e) {}
  }

  // ── Section routing ────────────────────────────────────────────────
  _showSection(name) {
    document.querySelectorAll('.admin-section').forEach((s) => s.classList.remove('active'));
    const section = document.getElementById(`section-${name}`);
    if (section) section.classList.add('active');

    this.views.sidebar.setActive(name);

    switch (name) {
      case 'dashboard':
        this._loadDashboard();
        break;
      case 'album':
        this._loadAlbums();
        break;
      case 'users':
        this._loadUsers();
        break;
    }
  }

  async _openAlbumHub(id) {
    try {
      const album = await adminService.getAlbum(id);
      const tracks = await adminService.getTracks(id);
      AdminState.set('selectedAlbum', album);

      this.views.albumDetail.render(album, tracks);

      document.getElementById('albums-list-container').classList.add('hidden');
      document.getElementById('album-detail-container').classList.remove('hidden');

      const btnNewAlbum = document.getElementById('btn-new-album');
      if (btnNewAlbum) btnNewAlbum.classList.add('hidden');
    } catch (e) {
      console.error('AdminController: Failed to open Hub:', e);
      toast.error(`Erro ao abrir álbum: ${e.message || 'Erro desconhecido'}`);
    }
  }

  async _refreshAlbumHub() {
    const selected = AdminState.get('selectedAlbum');
    if (!selected) return;
    try {
      const tracks = await adminService.getTracks(selected._id);
      this.views.albumDetail.render(selected, tracks);
    } catch (e) {}
  }

  // ── Data loaders ───────────────────────────────────────────────────
  async _loadDashboard() {
    try {
      const albums = await adminService.getAlbums();
      const firstAlbumId = albums[0]?._id;
      if (firstAlbumId) {
        const tracks = await adminService.getTracks(firstAlbumId);
        AdminState.set('tracks', tracks);
        this.views.dashboard.render(tracks);
      }
    } catch (e) {
      toast.error('Erro ao carregar dashboard');
    }
  }

  async _loadAlbums() {
    document.getElementById('albums-list-container').classList.remove('hidden');
    document.getElementById('album-detail-container').classList.add('hidden');

    const btnNewAlbum = document.getElementById('btn-new-album');
    if (btnNewAlbum) btnNewAlbum.classList.remove('hidden');

    this.views.albums.setTableLoading(true);
    try {
      const albums = await adminService.getAlbums();
      AdminState.set('albums', albums);
      this.views.albums.setTableData(albums);
    } catch (e) {
      toast.error('Erro ao carregar álbuns');
      this.views.albums.setTableData([]);
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
