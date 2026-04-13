/**
 * AlbumsView — Table of all albums + modal for creation.
 */
import { $ } from '../utils/dom.js';
import { DataTable } from '../components/DataTable.js';
import { BaseFormModal } from '../components/BaseFormModal.js';
import { formatDate } from '../utils/dom.js';

export class AlbumsView {
  constructor(ids) {
    this.tableContainerEl = $(ids.tableContainer);

    /** @type {Function|null} (albumData, id?) => void */
    this.onSave = null;
    /** @type {Function|null} (id) => void */
    this.onView = null;
    /** @type {Function|null} (id, title) => void */
    this.onDelete = null;

    this._buildTable();
    this.form = new AlbumFormModal();
    this.form.onSave = (data, id) => { if (this.onSave) this.onSave(data, id); };
  }

  _buildTable() {
    this.table = new DataTable(this.tableContainerEl, {
      columns: [
        { key: 'title', label: 'Álbum', className: 'font-medium', render: (v) => `<span style="color:var(--text-primary)">${v}</span>` },
        { key: 'artist', label: 'Artista', className: 'text-sm' },
        {
          key: 'date', label: 'Data', className: 'text-xs font-mono',
          render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '--'
        }
      ],
      actions: [
        { label: 'Gerenciar', variant: 'ghost', onClick: (row) => { if (this.onView) this.onView(row._id || row.id); } },
        { label: 'Excluir', variant: 'danger', onClick: (row) => { if (this.onDelete) this.onDelete(row._id || row.id, row.title); } }
      ],
      emptyMessage: 'Nenhum álbum cadastrado.',
      minWidth: '600px'
    });
  }

  setTableData(albums) { this.table.setData(albums); }
  setTableLoading(loading) { this.table.setLoading(loading); }

  openNewForm() { this.form.openNew(); }
  openEditFormSkeleton() { this.form.openSkeleton(); }
  populateEditForm(album) { this.form.populate(album); }
  closeModal() { this.form.close(); }
  showFormError(msg) { this.form.showError(msg); }
}

class AlbumFormModal extends BaseFormModal {
  constructor() {
    super({
      titleNew: 'Novo Álbum',
      titleEdit: 'Editar Álbum',
      size: 'md',
      saveBtnText: 'Salvar Álbum'
    });
  }

  _getFormHtml() {
    return `
      <form id="album-form" class="space-y-4">
        <div>
          <label class="label">Título</label>
          <input type="text" id="album-title" class="glass-input" placeholder="Título do álbum" required />
        </div>
        <div>
          <label class="label">Artista</label>
          <input type="text" id="album-artist" class="glass-input" placeholder="Nome do artista" required />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Evento</label>
            <input type="text" id="album-event" class="glass-input" placeholder="Nome do evento" />
          </div>
          <div>
            <label class="label">Data do Evento</label>
            <input type="datetime-local" id="album-date" class="glass-input" />
          </div>
        </div>
        <div>
          <label class="label">Link de Pre-save (Opcional)</label>
          <input type="url" id="album-pre-save-link" class="glass-input" placeholder="https://spotify.com/pre-save/..." />
        </div>
      </form>
    `;
  }

  _getFormValues() {
    return {
      title: $('album-title').value.trim(),
      artist: $('album-artist').value.trim(),
      event: $('album-event').value.trim(),
      date: $('album-date').value,
      preSaveLink: $('album-pre-save-link').value.trim()
    };
  }

  onReset() {
    const form = $('album-form');
    if (form) form.reset();
  }

  onPopulate(album) {
    $('album-title').value = album.title || '';
    $('album-artist').value = album.artist || '';
    $('album-event').value = album.event || '';
    if (album.date) {
      try {
        $('album-date').value = new Date(album.date).toISOString().slice(0, 16);
      } catch(e) { }
    } else {
      $('album-date').value = '';
    }
    $('album-pre-save-link').value = album.preSaveLink || '';
  }
}
