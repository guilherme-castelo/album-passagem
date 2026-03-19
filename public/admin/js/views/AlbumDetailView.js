/**
 * AlbumDetailView — The "Hub" for a single album.
 * Displays album info + integrated tracks table.
 */
import { $ } from '../utils/dom.js';
import { DataTable } from '../components/DataTable.js';
import { formatDate } from '../utils/dom.js';

const STATUS_COLORS = {
  'ON TIME': 'badge-success',
  'DELAYED': 'badge-error',
  'FINAL CALL': 'badge-warning',
  'BOARDING': 'badge-info'
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

        <!-- Tracks Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-lg text-white">Faixas do Álbum</h3>
            <button id="btn-add-track-context" class="btn-primary flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Adicionar Música
            </button>
          </div>
          <div id="album-tracks-table"></div>
        </div>
      </div>
    `;

    this._setupTable();
    this._attachEvents();
  }

  _setupTable() {
    this.table = new DataTable($('album-tracks-table'), {
      columns: [
        {
          key: 'drag', label: '', className: 'w-8 text-center cursor-move opacity-40 hover:opacity-100',
          render: () => `
            <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
            </svg>
          `
        },
        { key: 'flightCode', label: 'Voo', className: 'font-mono text-xs' },
        { key: 'title', label: 'Título', className: 'font-medium' },
        {
          key: 'status', label: 'Status',
          render: (val) => `<span class="badge ${STATUS_COLORS[val] || 'badge-info'}">${val}</span>`
        },
        {
          key: 'interactions', label: 'Likes', className: 'text-xs',
          render: (val) => `<span style="color:var(--accent-pink)">❤️ ${val?.likes || 0}</span>`
        }
      ],
      actions: [
        { label: 'Editar', variant: 'ghost', onClick: (row) => { if (this.onEditTrack) this.onEditTrack(row._id); } },
        { label: 'Excluir', variant: 'danger', onClick: (row) => { if (this.onDeleteTrack) this.onDeleteTrack(row._id, row.title); } }
      ],
      emptyMessage: 'Nenhuma faixa neste álbum.',
      minWidth: '600px'
    });

    // We override renderBody to add draggable attribute
    const originalRenderBody = this.table._renderBody.bind(this.table);
    this.table._renderBody = () => {
      originalRenderBody();
      this.table.tbody.querySelectorAll('tr').forEach(tr => {
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
    const trackIds = rows.map(tr => tr.querySelector('button[data-row-id]').dataset.rowId);

    // Optimistic UI: update flightCodes locally
    rows.forEach((tr, index) => {
      const codeEl = tr.querySelector('.font-mono');
      if (codeEl) codeEl.textContent = `PSG${String(index + 1).padStart(2, '0')}`;
    });

    if (this.onReorder) this.onReorder(trackIds);
  }

  _attachEvents() {
    $('btn-back-albums').addEventListener('click', () => { if (this.onBack) this.onBack(); });
    $('btn-edit-album').addEventListener('click', () => { if (this.onEditAlbum) this.onEditAlbum(this._album); });
    $('btn-add-track-context').addEventListener('click', () => { if (this.onAddTrack) this.onAddTrack(); });
  }

  renderLoading() {
    $('display-album-id').innerHTML = '<div class="skeleton h-3 w-16 inline-block rounded opacity-20"></div>';
    
    const display = $('album-info-display');
    display.innerHTML = `
      <div>
        <p class="label">Título</p>
        <div class="skeleton h-5 w-3/4 rounded mt-1 opacity-20"></div>
      </div>
      <div>
        <p class="label">Artista</p>
        <div class="skeleton h-5 w-2/3 rounded mt-1 opacity-20"></div>
      </div>
      <div>
        <p class="label">Evento</p>
        <div class="skeleton h-5 w-1/2 rounded mt-1 opacity-20"></div>
      </div>
      <div>
        <p class="label">Data</p>
        <div class="skeleton h-5 w-2/4 rounded mt-1 opacity-20"></div>
      </div>
    `;

    this.table.setLoading(true);
  }

  render(album, tracks) {
    this._album = album;
    $('display-album-id').textContent = album.id || album._id;
    this._renderInfo(album);
    this.table.setData(tracks);
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

  setTracksLoading(loading) { this.table.setLoading(loading); }
}
