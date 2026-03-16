/**
 * AlbumView — Album info form in a modal.
 */
import { $ } from '../utils/dom.js';
import { ModalComponent } from '../components/ModalComponent.js';

export class AlbumView {
  constructor(containerId) {
    this.container = $(containerId);
    /** @type {Function|null} */
    this.onSave = null;

    this._buildModal();
    this._buildTrigger();
  }

  _buildModal() {
    this.modal = new ModalComponent({ title: 'Editar Álbum', size: 'md' });
    this.modal.setBody(`
      <form id="album-form" class="space-y-5">
        <div>
          <label class="label">Título</label>
          <input type="text" id="album-title" class="glass-input" placeholder="Passagem" />
        </div>
        <div>
          <label class="label">Artista</label>
          <input type="text" id="album-artist" class="glass-input" placeholder="Bruno" />
        </div>
        <div>
          <label class="label">Evento</label>
          <input type="text" id="album-event" class="glass-input" placeholder="Pré-lançamento..." />
        </div>
        <div>
          <label class="label">Data do Evento</label>
          <input type="datetime-local" id="album-date" class="glass-input" />
        </div>
      </form>
    `);
    this.modal.setFooter(`
      <button id="album-cancel-btn" class="btn-ghost">Cancelar</button>
      <button id="album-save-btn" class="btn-save">Salvar Álbum</button>
    `);

    this.modal.getBodyElement().closest('.modal-panel').querySelector('#album-save-btn')
      .addEventListener('click', () => {
        if (this.onSave) this.onSave(this.getValues());
      });

    this.modal.getBodyElement().closest('.modal-panel').querySelector('#album-cancel-btn')
      .addEventListener('click', () => this.modal.close());
  }

  _buildTrigger() {
    // Info card shown in the section
    this.container.innerHTML = `
      <div class="glass-card p-6 max-w-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-sm" style="color: var(--text-secondary)">DADOS DO ÁLBUM</h3>
          <button id="album-edit-btn" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.75rem;">
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Editar
            </span>
          </button>
        </div>
        <div id="album-info-display" class="space-y-3 text-sm">
          <div class="skeleton" style="height: 5rem; border-radius: 0.5rem;"></div>
        </div>
      </div>
    `;

    $('album-edit-btn').addEventListener('click', () => this.modal.open());
  }

  setValues(data) {
    this._data = data;
    const set = (id, val) => { const el = $(id); if (el) el.value = val || ''; };
    set('album-title', data.title);
    set('album-artist', data.artist);
    set('album-event', data.event);
    if (data.date) {
      const d = new Date(data.date);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      set('album-date', local);
    }
    this._renderInfo(data);
  }

  _renderInfo(data) {
    const display = $('album-info-display');
    if (!display) return;
    display.innerHTML = `
      <div class="grid grid-cols-2 gap-4">
        <div class="py-2">
          <p class="label">Título</p>
          <p class="font-medium" style="color: var(--text-primary)">${data.title || '--'}</p>
        </div>
        <div class="py-2">
          <p class="label">Artista</p>
          <p class="font-medium" style="color: var(--text-primary)">${data.artist || '--'}</p>
        </div>
        <div class="py-2">
          <p class="label">Evento</p>
          <p class="font-medium" style="color: var(--text-primary)">${data.event || '--'}</p>
        </div>
        <div class="py-2">
          <p class="label">Data</p>
          <p class="font-medium" style="color: var(--text-primary)">${data.date ? new Date(data.date).toLocaleDateString('pt-BR') : '--'}</p>
        </div>
      </div>
    `;
  }

  getValues() {
    return {
      title: $('album-title')?.value || '',
      artist: $('album-artist')?.value || '',
      event: $('album-event')?.value || '',
      date: $('album-date')?.value || ''
    };
  }

  closeModal() {
    this.modal.close();
  }
}
