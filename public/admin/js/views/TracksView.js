/**
 * TracksView — Tracks table + modal form with Quill editor.
 */
import { $, $$ } from '../utils/dom.js';
import { DataTable } from '../components/DataTable.js';
import { ModalComponent } from '../components/ModalComponent.js';

const STATUS_COLORS = {
  'ON TIME': 'badge-success',
  'DELAYED': 'badge-error',
  'FINAL CALL': 'badge-warning',
  'BOARDING': 'badge-info'
};

export class TracksView {
  constructor(ids) {
    this.tableContainerEl = $(ids.tableContainer);
    this.formContainerEl = $(ids.formContainer);

    /** @type {Function|null} (trackData, id?) => void */
    this.onSave = null;
    /** @type {Function|null} (id) => void */
    this.onEdit = null;
    /** @type {Function|null} (id, title) => void */
    this.onDelete = null;

    this.quill = null;
    if (this.tableContainerEl) {
      this._buildTable();
    }
    this._buildModal();
  }

  _buildTable() {
    this.table = new DataTable(this.tableContainerEl, {
      columns: [
        { key: 'id', label: 'ID', className: 'font-mono text-xs', render: (v) => `<span style="color:var(--text-muted)">${v}</span>` },
        { key: 'gate', label: 'Portão', className: 'font-mono font-bold', render: (v) => `<span style="color:var(--accent-violet)">${v}</span>` },
        { key: 'flightCode', label: 'Código', className: 'font-mono text-xs' },
        { key: 'title', label: 'Título', className: 'font-medium', render: (v) => `<span style="color:var(--text-primary)">${v}</span>` },
        {
          key: 'status', label: 'Status',
          render: (val) => `<span class="badge ${STATUS_COLORS[val] || 'badge-info'}">${val}</span>`
        },
        {
          key: 'interactions', label: 'Likes', className: 'font-mono text-xs',
          render: (val) => `<span style="color:var(--accent-pink)">❤️ ${val?.likes || 0}</span>`
        }
      ],
      actions: [
        { label: 'Editar', variant: 'ghost', onClick: (row) => { if (this.onEdit) this.onEdit(row.id); } },
        { label: 'Excluir', variant: 'danger', onClick: (row) => { if (this.onDelete) this.onDelete(row.id, row.title); } }
      ],
      emptyMessage: 'Nenhuma faixa cadastrada.',
      minWidth: '700px'
    });
  }

  _buildModal() {
    this.modal = new ModalComponent({ title: 'Nova Faixa', size: 'lg' });

    this.modal.setBody(`
      <form id="track-form" class="space-y-5">
        <input type="hidden" id="track-id" />
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="label">Portão (Gate)</label>
            <input type="text" id="track-gate" class="glass-input" placeholder="A01" />
          </div>
          <div>
            <label class="label">Código do Voo</label>
            <input type="text" id="track-flightCode" class="glass-input" placeholder="PSG01" />
          </div>
          <div>
            <label class="label">Status</label>
            <select id="track-status" class="glass-input">
              <option value="ON TIME">ON TIME</option>
              <option value="DELAYED">DELAYED</option>
              <option value="FINAL CALL">FINAL CALL</option>
              <option value="BOARDING">BOARDING</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Título da Faixa</label>
            <input type="text" id="track-title" class="glass-input" placeholder="Nome da música" required />
          </div>
          <div id="album-select-container">
            <label class="label">Álbum</label>
            <select id="track-albumId" class="glass-input" required>
              <option value="">Selecione um álbum...</option>
            </select>
          </div>
        </div>

        <div>
          <label class="label">Letra (Lyrics)</label>
          <div id="lyrics-editor"></div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="label mb-0">Links de Mídia</label>
            <button type="button" id="btn-add-media" class="btn-ghost flex items-center gap-1" style="font-size: 0.7rem;">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Adicionar
            </button>
          </div>
          <div id="media-fields" class="space-y-2"></div>
        </div>

        <div id="track-form-error" class="hidden text-sm rounded-lg px-4 py-3" style="background: var(--status-error-bg); border: 1px solid var(--status-error-border); color: var(--status-error-text);"></div>
      </form>
    `);

    this.modal.setFooter(`
      <button id="track-cancel-btn" class="btn-ghost">Cancelar</button>
      <button id="track-save-btn" class="btn-save">Salvar Faixa</button>
    `);

    const panel = this.modal.getBodyElement().closest('.modal-panel');
    panel.querySelector('#track-save-btn').addEventListener('click', () => {
      if (this.onSave) {
        this.onSave(this.getFormValues(), this._editingId);
      }
    });

    panel.querySelector('#track-cancel-btn').addEventListener('click', () => this.modal.close());
    panel.querySelector('#btn-add-media').addEventListener('click', () => this._addMediaField());
  }

  _initQuill() {
    if (this.quill) return;
    if (typeof Quill === 'undefined') return;
    this.quill = new Quill('#lyrics-editor', {
      theme: 'snow',
      placeholder: 'Insira a letra da música aqui...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ header: [1, 2, 3, false] }],
          ['clean']
        ]
      }
    });
  }

  setTableData(tracks) { this.table.setData(tracks); }
  setTableLoading(loading) { this.table.setLoading(loading); }

  openNewForm() {
    this.modal.setTitle('Nova Faixa');
    this.modal.open();
    // setTimeout because modal needs to be visible for Quill to initialize
    setTimeout(() => {
      this._initQuill();
      if (this.quill) this.quill.setText('');
      $('media-fields').innerHTML = '';
    }, 50);
  }

  openEditFormSkeleton() {
    this._editingId = null;
    this.modal.setTitle('Carregando Faixa...');
    this.modal.open();
    this.modal.setLoading(true);
    // setTimeout because modal needs to be visible for Quill to initialize
    setTimeout(() => {
      this._initQuill();
      if (this.quill) this.quill.setText('');
      $('track-gate').value = '';
      $('track-flightCode').value = '';
      $('track-title').value = '';
      $('track-status').value = 'ON TIME';
      $('track-albumId').value = '';
      $('media-fields').innerHTML = '';
      $('track-form-error').classList.add('hidden');
    }, 50);
  }

  populateEditForm(track) {
    this._editingId = track._id || track.id;
    this.modal.setTitle('Editar Música');
    this.modal.setLoading(false);
    
    $('track-gate').value = track.gate || '';
    $('track-flightCode').value = track.flightCode || '';
    $('track-title').value = track.title || '';
    $('track-status').value = track.status || 'ON TIME';
    $('track-albumId').value = track.albumId || '';
    if (this.quill) this.quill.setText(track.lyrics || '');

    $('media-fields').innerHTML = '';
    (track.media || []).forEach(m => this._addMediaField(m.origin, m.content));
    $('track-form-error').classList.add('hidden');
  }

  closeForm() { this.modal.close(); }

  showFormError(msg) {
    const el = $('track-form-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  getFormValues() {
    const mediaRows = Array.from(document.querySelectorAll('.media-row'));
    const media = [];
    mediaRows.forEach(row => {
      const origin = row.querySelector('.media-origin').value;
      const content = row.querySelector('.media-content').value.trim();
      if (content) media.push({ type: 'iframe', origin, content });
    });

    return {
      albumId: $('track-albumId').value,
      gate: $('track-gate').value.trim(),
      flightCode: $('track-flightCode').value.trim(),
      title: $('track-title').value.trim(),
      status: $('track-status').value,
      lyrics: this.quill ? this.quill.getText().trim() : '',
      media
    };
  }

  setAlbums(albums, currentAlbumId = null) {
    const select = $('track-albumId');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione um álbum...</option>' +
      albums.map(a => `<option value="${a._id || a.id}" ${currentAlbumId === (a._id || a.id) ? 'selected' : ''}>${a.title}</option>`).join('');

    // If we're in a specific album context, we can optionally hide this or make it readonly
    const container = $('album-select-container');
    if (currentAlbumId && container) {
      container.classList.add('opacity-50', 'pointer-events-none');
    } else if (container) {
      container.classList.remove('opacity-50', 'pointer-events-none');
    }
  }

  _addMediaField(origin = 'youtube', content = '') {
    const container = $('media-fields');
    const div = document.createElement('div');
    div.className = 'media-row flex flex-col sm:flex-row items-center gap-2 p-2 rounded-lg border';
    div.style.cssText = 'background: rgba(255,255,255,0.03); border-color: var(--glass-border);';
    div.innerHTML = `
      <select class="media-origin glass-input" style="padding:0.5rem; width: auto; min-width: 7rem;">
        <option value="youtube" ${origin === 'youtube' ? 'selected' : ''}>YouTube</option>
        <option value="spotify" ${origin === 'spotify' ? 'selected' : ''}>Spotify</option>
      </select>
      <input type="url" class="media-content glass-input flex-1" style="padding:0.5rem;" placeholder="URL do iframe/video" value="${content}" />
      <button type="button" class="btn-danger" style="padding:0.4rem 0.6rem">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    div.querySelector('.btn-danger').addEventListener('click', () => div.remove());
    container.appendChild(div);
  }
}
