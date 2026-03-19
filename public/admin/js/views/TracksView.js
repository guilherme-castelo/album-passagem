/**
 * TracksView — Tracks table + modal form with Quill editor.
 */
import { $, $$ } from '../utils/dom.js';
import { DataTable } from '../components/DataTable.js';
import { BaseFormModal } from '../components/BaseFormModal.js';

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

    if (this.tableContainerEl) {
      this._buildTable();
    }
    
    this.form = new TrackFormModal();
    this.form.onSave = (data, id) => { if(this.onSave) this.onSave(data, id); };
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

  setTableData(tracks) { this.table.setData(tracks); }
  setTableLoading(loading) { this.table.setLoading(loading); }

  openNewForm() { this.form.openNew(); }
  openEditFormSkeleton() { this.form.openSkeleton(); }
  populateEditForm(track) { this.form.populate(track); }
  closeForm() { this.form.close(); }
  showFormError(msg) { this.form.showError(msg); }
  setAlbums(albums, currentAlbumId = null) { this.form.setAlbums(albums, currentAlbumId); }
}

class TrackFormModal extends BaseFormModal {
  constructor() {
    super({
      titleNew: 'Nova Faixa',
      titleEdit: 'Editar Música',
      size: 'lg',
      saveBtnText: 'Salvar Faixa'
    });
    this.quill = null;
    this.modal.getBodyElement().closest('.modal-panel').querySelector('#btn-add-media')?.addEventListener('click', () => this._addMediaField());
  }

  _getFormHtml() {
    return `
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
      </form>
    `;
  }

  _initQuill() {
    if (this.quill) return;
    if (typeof Quill === 'undefined') return;
    this.quill = new Quill(this.modal.getBodyElement().querySelector('#lyrics-editor'), {
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

  _getFormValues() {
    const parent = this.modal.getBodyElement();
    const mediaRows = Array.from(parent.querySelectorAll('.media-row'));
    const media = [];
    mediaRows.forEach(row => {
      const origin = row.querySelector('.media-origin').value;
      const content = row.querySelector('.media-content').value.trim();
      if (content) media.push({ type: 'iframe', origin, content });
    });

    return {
      albumId: parent.querySelector('#track-albumId').value,
      gate: parent.querySelector('#track-gate').value.trim(),
      flightCode: parent.querySelector('#track-flightCode').value.trim(),
      title: parent.querySelector('#track-title').value.trim(),
      status: parent.querySelector('#track-status').value,
      lyrics: this.quill ? this.quill.getText().trim() : '',
      media
    };
  }

  onReset() {
    setTimeout(() => {
      this._initQuill();
      if (this.quill) this.quill.setText('');
      const p = this.modal.getBodyElement();
      p.querySelector('#track-gate').value = '';
      p.querySelector('#track-flightCode').value = '';
      p.querySelector('#track-title').value = '';
      p.querySelector('#track-status').value = 'ON TIME';
      p.querySelector('#track-albumId').value = '';
      p.querySelector('#media-fields').innerHTML = '';
      p.querySelector('#btn-add-media').onclick = () => this._addMediaField();
    }, 50);
  }

  onPopulate(track) {
    const p = this.modal.getBodyElement();
    p.querySelector('#track-gate').value = track.gate || '';
    p.querySelector('#track-flightCode').value = track.flightCode || '';
    p.querySelector('#track-title').value = track.title || '';
    p.querySelector('#track-status').value = track.status || 'ON TIME';
    p.querySelector('#track-albumId').value = track.albumId || '';
    if (this.quill) this.quill.setText(track.lyrics || '');

    p.querySelector('#media-fields').innerHTML = '';
    (track.media || []).forEach(m => this._addMediaField(m.origin, m.content));
  }

  setAlbums(albums, currentAlbumId = null) {
    const select = this.modal.getBodyElement().querySelector('#track-albumId');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione um álbum...</option>' +
      albums.map(a => `<option value="${a._id || a.id}" ${currentAlbumId === (a._id || a.id) ? 'selected' : ''}>${a.title}</option>`).join('');

    const container = this.modal.getBodyElement().querySelector('#album-select-container');
    if (currentAlbumId && container) {
      container.classList.add('opacity-50', 'pointer-events-none');
    } else if (container) {
      container.classList.remove('opacity-50', 'pointer-events-none');
    }
  }

  _addMediaField(origin = 'youtube', content = '') {
    const container = this.modal.getBodyElement().querySelector('#media-fields');
    if (!container) return;
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
