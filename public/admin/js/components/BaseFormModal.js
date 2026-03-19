/**
 * BaseFormModal — Abstract class for admin forms.
 * Handles ModalComponent instantiation, skeleton loading, errors, and save events.
 * 
 * Subclasses must implement:
 * - `_getFormHtml()`
 * - `_getFormValues()`
 * - `onPopulate(data)`
 * - `onReset()`
 */
import { ModalComponent } from './ModalComponent.js';

export class BaseFormModal {
  constructor(options) {
    this.titleNew = options.titleNew || 'Novo Item';
    this.titleEdit = options.titleEdit || 'Editar Item';
    this.size = options.size || 'md';
    this.saveBtnText = options.saveBtnText || 'Salvar';
    
    /** @type {Function|null} (data, id?) => void */
    this.onSave = null;
    
    this._editingId = null;
    this._buildModal();
  }

  _buildModal() {
    this.modal = new ModalComponent({ title: this.titleNew, size: this.size });
    
    // Injects subclass HTML and generic error container
    this.modal.setBody(`
      ${this._getFormHtml()}
      <div id="base-form-error" class="hidden mt-4 text-sm rounded-lg px-4 py-3" style="background: var(--status-error-bg); border: 1px solid var(--status-error-border); color: var(--status-error-text);"></div>
    `);

    // Generic footer
    this.modal.setFooter(`
      <button id="base-cancel-btn" class="btn-ghost">Cancelar</button>
      <button id="base-save-btn" class="btn-save">${this.saveBtnText}</button>
    `);

    const panel = this.modal.getBodyElement().closest('.modal-panel');
    
    // Bind Save
    panel.querySelector('#base-save-btn').addEventListener('click', () => {
      if (this.onSave) {
        this.onSave(this._getFormValues(), this._editingId);
      }
    });

    // Bind Cancel
    panel.querySelector('#base-cancel-btn').addEventListener('click', () => this.modal.close());
  }

  /**
   * Opens the form for creating a new item.
   */
  openNew() {
    this._editingId = null;
    this.modal.setTitle(this.titleNew);
    this.hideError();
    this.onReset();
    this.modal.open();
  }

  /**
   * Opens the form showing skeleton loaders while data is fetched.
   * @param {string|number|null} id The item ID being loaded.
   */
  openSkeleton(id = null) {
    this._editingId = id;
    this.modal.setTitle('Carregando...');
    this.hideError();
    this.onReset();
    this.modal.open();
    this.modal.setLoading(true);
  }

  /**
   * Populates the form with actual data and removes skeleton loaders.
   * @param {Object} data The entity data.
   */
  populate(data) {
    this._editingId = data._id || data.id;
    const dynamicTitle = typeof this.titleEdit === 'function' ? this.titleEdit(data) : this.titleEdit;
    this.modal.setTitle(dynamicTitle);
    this.modal.setLoading(false);
    this.hideError();
    this.onPopulate(data);
    this.modal.open();
  }

  close() {
    this.modal.close();
  }

  showError(msg) {
    const errEl = this.modal.getBodyElement().querySelector('#base-form-error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
    }
  }

  hideError() {
    const errEl = this.modal.getBodyElement().querySelector('#base-form-error');
    if (errEl) {
      errEl.classList.add('hidden');
    }
  }

  // ── Abstract Methods to Override ──────────────────────────────────────────

  /** @returns {string} The HTML string for the form body. */
  _getFormHtml() { return ''; }

  /** @returns {Object} The assembled data payload from inputs. */
  _getFormValues() { return {}; }

  /** @param {Object} data Populate inputs with entity data. */
  onPopulate(data) {}

  /** Reset internal form inputs. */
  onReset() {}
}
