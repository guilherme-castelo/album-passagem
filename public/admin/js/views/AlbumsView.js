/**
 * AlbumsView — Table of all albums + modal for creation.
 */
import { $ } from '../utils/dom.js';
import { DataTable } from '../components/DataTable.js';
import { ModalComponent } from '../components/ModalComponent.js';
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

    this._editingId = null;
    this._buildTable();
    this._buildModal();
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

  _buildModal() {
    this.modal = new ModalComponent({ title: 'Novo Álbum', size: 'md' });
    this.modal.setBody(`
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
        <div id="album-form-error" class="hidden text-sm rounded-lg px-4 py-3" style="background: var(--status-error-bg); border: 1px solid var(--status-error-border); color: var(--status-error-text);"></div>
      </form>
    `);

    this.modal.setFooter(`
      <button id="album-cancel-btn" class="btn-ghost">Cancelar</button>
      <button id="album-save-btn" class="btn-save">Salvar Álbum</button>
    `);

    const panel = this.modal.getBodyElement().closest('.modal-panel');
    panel.querySelector('#album-save-btn').addEventListener('click', () => {
      if (this.onSave) {
        this.onSave(this.getValues(), this._editingId);
      }
    });
    panel.querySelector('#album-cancel-btn').addEventListener('click', () => this.modal.close());
  }

  setTableData(albums) { this.table.setData(albums); }
  setTableLoading(loading) { this.table.setLoading(loading); }

  openNewForm() {
    this._editingId = null;
    this.modal.setTitle('Novo Álbum');
    $('album-form').reset();
    $('album-form-error').classList.add('hidden');
    this.modal.open();
  }

  getValues() {
    return {
      title: $('album-title').value.trim(),
      artist: $('album-artist').value.trim(),
      event: $('album-event').value.trim(),
      date: $('album-date').value
    };
  }

  closeModal() { this.modal.close(); }
  showFormError(msg) {
    const el = $('album-form-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }
}
