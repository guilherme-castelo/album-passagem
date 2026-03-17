/**
 * AlbumDetailView — The "Hub" for a single album.
 * Displays album info + integrated tracks table.
 */
import { $, $$ } from '../utils/dom.js';
import { DataTable } from '../components/DataTable.js';
import { ThemeEditor } from '../components/ThemeEditor.js';

const STATUS_COLORS = {
  'ON TIME': 'badge-success',
  DELAYED: 'badge-error',
  'FINAL CALL': 'badge-warning',
  BOARDING: 'badge-info'
};

export class AlbumDetailView {
  constructor(containerId) {
    this.container = $(containerId);

    /** @type {Function|null} */
    this.onBack = null;
    /** @type {Function|null} (albumData) => void */
    this.onSaveAlbum = null;
    /** @type {Function|null} () => void */
    this.onAddTrack = null;
    /** @type {Function|null} (trackId) => void */
    this.onEditTrack = null;
    /** @type {Function|null} (trackId, title) => void */
    this.onDeleteTrack = null;
    /** @type {Function|null} (newConfig) => void */
    this.onSaveTheme = null;
    /** @type {Function|null} (trackIds) => void */
    this.onReorder = null;

    this._album = null;
    this._buildLayout();
  }

  _buildLayout() {
    this.container.innerHTML = `
      <div class="flex flex-col gap-8">
        <!-- Breadcrumb & Header -->
        <div class="flex items-center justify-between">
          <button id="btn-back-albums" class="btn-ghost flex items-center gap-2 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Voltar para Álbuns
          </button>
          <div class="flex items-center gap-3">
            <span class="badge badge-info font-mono text-[10px]">ID: <span id="display-album-id">--</span></span>
          </div>
        </div>

        <!-- Album Info Card -->
        <div id="album-info-card" class="glass-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-lg text-white">Dados do Álbum</h3>
            <button id="btn-edit-album" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.75rem;">Editar Álbum</button>
          </div>
          <div id="album-info-display" class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Rendered via renderInfo() -->
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-1 border-b border-white/10">
          <button id="tab-tracks" class="tab-btn active">Músicas</button>
          <button id="tab-theme" class="tab-btn">Aparência do Álbum</button>
        </div>

        <!-- Tab Content: Tracks -->
        <div id="content-tracks" class="tab-content active space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-lg text-white">Faixas do Álbum</h3>
            <button id="btn-add-track-context" class="btn-primary flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Adicionar Música
            </button>
          </div>
          <div id="album-tracks-table"></div>
        </div>

        <!-- Tab Content: Theme -->
        <div id="content-theme" class="tab-content hidden">
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <!-- Sidebar: Editor -->
            <div id="theme-editor-container" class="space-y-6"></div>
            
            <!-- Sticky Preview Pane -->
            <div class="xl:sticky xl:top-8 space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-white text-sm uppercase tracking-widest flex items-center gap-2">
                  <svg class="w-4 h-4 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  Preview em Tempo Real
                </h4>
                <button id="btn-refresh-preview" class="btn-ghost text-[10px] p-1">Recarregar Preview</button>
              </div>
              <div class="bg-slate-900 rounded-2xl p-4 border border-white/5 shadow-2xl overflow-hidden aspect-[9/16] max-h-[700px] mx-auto xl:mx-0 w-full max-w-[400px]">
                <iframe id="preview-iframe" src="" class="w-full h-full rounded-lg bg-white" frameborder="0"></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._setupTable();
    this._setupThemeEditor();
    this._attachEvents();
  }

  _setupThemeEditor() {
    this.themeEditor = new ThemeEditor($('theme-editor-container'));
    this.themeEditor.onSave = (config) => {
      if (this.onSaveTheme) this.onSaveTheme(config);
    };
  }

  _setupTable() {
    this.table = new DataTable($('album-tracks-table'), {
      columns: [
        {
          key: 'drag',
          label: '',
          className: 'w-8 text-center cursor-move opacity-40 hover:opacity-100',
          render: () => `
            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
            </svg>
          `
        },
        { key: 'flightCode', label: 'Cód. Faixa', className: 'font-mono text-xs' },
        { key: 'title', label: 'Título', className: 'font-medium' },
        {
          key: 'status',
          label: 'Status',
          render: (val) => `<span class="badge ${STATUS_COLORS[val] || 'badge-info'}">${val}</span>`
        },
        {
          key: 'interactions',
          label: 'Likes',
          className: 'text-xs',
          render: (val) => `<span style="color:var(--accent-pink)">❤️ ${val?.likes || 0}</span>`
        }
      ],
      actions: [
        {
          label: 'Editar',
          variant: 'ghost',
          onClick: (row) => {
            if (this.onEditTrack) this.onEditTrack(row._id);
          }
        },
        {
          label: 'Excluir',
          variant: 'danger',
          onClick: (row) => {
            if (this.onDeleteTrack) this.onDeleteTrack(row._id, row.title);
          }
        }
      ],
      emptyMessage: 'Nenhuma faixa neste álbum.',
      minWidth: '600px'
    });

    // We override renderBody to add draggable attribute
    const originalRenderBody = this.table._renderBody.bind(this.table);
    this.table._renderBody = () => {
      originalRenderBody();
      this.table.tbody.querySelectorAll('tr').forEach((tr) => {
        tr.setAttribute('draggable', 'true');
        tr.classList.add('drag-row');
      });
      this._setupDragAndDrop();
    };
  }

  _setupDragAndDrop() {
    const tbody = this.table.tbody;
    let draggedRow = null;

    tbody.addEventListener('dragstart', (e) => {
      draggedRow = e.target.closest('tr');
      e.target.classList.add('opacity-50', 'bg-white/5');
      e.dataTransfer.effectAllowed = 'move';
    });

    tbody.addEventListener('dragend', (e) => {
      e.target.classList.remove('opacity-50', 'bg-white/5');
      draggedRow = null;
      this._handleReorder();
    });

    tbody.addEventListener('dragover', (e) => {
      e.preventDefault();
      const target = e.target.closest('tr');
      if (target && target !== draggedRow) {
        const rect = target.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        tbody.insertBefore(draggedRow, next ? target.nextSibling : target);
      }
    });
  }

  _handleReorder() {
    const rows = Array.from(this.table.tbody.querySelectorAll('tr'));
    const trackIds = rows.map((tr) => tr.querySelector('button[data-row-id]').dataset.rowId);

    // Optimistic UI: update flightCodes locally
    rows.forEach((tr, index) => {
      const codeEl = tr.querySelector('.font-mono');
      if (codeEl) codeEl.textContent = `PSG${String(index + 1).padStart(2, '0')}`;
    });

    if (this.onReorder) this.onReorder(trackIds);
  }

  _attachEvents() {
    $('btn-back-albums').addEventListener('click', () => {
      if (this.onBack) this.onBack();
    });
    $('btn-edit-album').addEventListener('click', () => {
      if (this.onEditAlbum) this.onEditAlbum(this._album);
    });
    $('btn-add-track-context').addEventListener('click', () => {
      if (this.onAddTrack) this.onAddTrack();
    });

    // Tab switching
    $('tab-tracks').addEventListener('click', () => this._switchTab('tracks'));
    $('tab-theme').addEventListener('click', () => {
      this._switchTab('theme');
      this._updatePreviewSource();
    });

    if ($('btn-refresh-preview')) {
      $('btn-refresh-preview').addEventListener('click', () => this._updatePreviewSource());
    }
  }

  _updatePreviewSource() {
    const iframe = $('preview-iframe');
    if (iframe && this._album) {
      // Navigate to the public view of this album
      // In a real app, this would be /a/[id] or similar
      const url = `../../index.html?albumId=${this._album._id || this._album.id}&preview=true`;
      if (iframe.src !== url) {
        iframe.src = url;
      }
    }
  }

  _switchTab(tab) {
    // Buttons
    $$('.tab-btn').forEach((b) => b.classList.remove('active'));
    $(`tab-${tab}`).classList.add('active');

    // Content
    $$('.tab-content').forEach((c) => {
      c.classList.add('hidden');
      c.classList.remove('active');
    });
    const selected = $(`content-${tab}`);
    selected.classList.remove('hidden');
    selected.classList.add('active');
  }

  render(album, tracks) {
    this._album = album;
    $('display-album-id').textContent = album.id || album._id;
    this._renderInfo(album);
    this.table.setData(tracks);
    this.themeEditor.render(album.uiConfig || {});
  }

  _renderInfo(data) {
    const display = $('album-info-display');
    display.innerHTML = `
      <div>
        <p class="label">Título</p>
        <p class="font-medium text-white">${data.title || '--'}</p>
      </div>
      <div>
        <p class="label">Artista</p>
        <p class="font-medium text-white">${data.artist || '--'}</p>
      </div>
      <div>
        <p class="label">Evento</p>
        <p class="font-medium text-white">${data.event || '--'}</p>
      </div>
      <div>
        <p class="label">Data</p>
        <p class="font-medium text-white">${data.date ? new Date(data.date).toLocaleDateString('pt-BR') : '--'}</p>
      </div>
    `;
  }

  setTracksLoading(loading) {
    this.table.setLoading(loading);
  }
}
