/**
 * UsersView — Users table + modal form for create/edit.
 */
import { $ } from '../utils/dom.js';
import { DataTable } from '../components/DataTable.js';
import { ModalComponent } from '../components/ModalComponent.js';
import { formatDate } from '../utils/dom.js';

export class UsersView {
  constructor(ids) {
    this.tableContainerEl = $(ids.tableContainer);
    this.formContainerEl = $(ids.formContainer);

    /** @type {Function|null} (userData, id?) => void */
    this.onSave = null;
    /** @type {Function|null} (id, username) => void */
    this.onDelete = null;

    this._editingId = null;
    this._buildTable();
    this._buildModal();
  }

  _buildTable() {
    this.table = new DataTable(this.tableContainerEl, {
      columns: [
        { key: 'username', label: 'Usuário', className: 'font-medium', render: (v) => `<span style="color:var(--text-primary)">${v}</span>` },
        {
          key: 'createdAt', label: 'Criado em', className: 'text-xs font-mono',
          render: (val) => formatDate(val)
        }
      ],
      actions: [
        { label: 'Editar', variant: 'ghost', onClick: (row) => this.openEditForm(row) },
        { label: 'Excluir', variant: 'danger', onClick: (row) => { if (this.onDelete) this.onDelete(row._id || row.id, row.username); } }
      ],
      emptyMessage: 'Nenhum usuário admin.',
      minWidth: '400px'
    });
  }

  _buildModal() {
    this.modal = new ModalComponent({ title: 'Novo Usuário', size: 'sm' });

    this.modal.setBody(`
      <form id="user-form" class="space-y-4">
        <div>
          <label class="label">Nome de Usuário</label>
          <input type="text" id="user-username" placeholder="admin" class="glass-input" required />
        </div>
        <div>
          <label class="label">Senha</label>
          <input type="password" id="user-password" placeholder="••••••••" class="glass-input" />
          <p id="user-password-hint" class="text-xs mt-1 hidden" style="color: var(--text-muted)">Deixe em branco para manter a senha atual.</p>
        </div>
        <div id="user-form-error" class="hidden text-sm rounded-lg px-4 py-3" style="background: var(--status-error-bg); border: 1px solid var(--status-error-border); color: var(--status-error-text);"></div>
      </form>
    `);

    this.modal.setFooter(`
      <button id="user-cancel-btn" class="btn-ghost">Cancelar</button>
      <button id="user-save-btn" class="btn-save">Salvar</button>
    `);

    const panel = this.modal.getBodyElement().closest('.modal-panel');

    panel.querySelector('#user-save-btn').addEventListener('click', () => {
      if (this.onSave) {
        const data = {
          username: $('user-username').value.trim(),
          password: $('user-password').value
        };
        this.onSave(data, this._editingId);
      }
    });

    panel.querySelector('#user-cancel-btn').addEventListener('click', () => this.modal.close());
  }

  setTableData(users) { this.table.setData(users); }
  setTableLoading(loading) { this.table.setLoading(loading); }

  /** Opens modal for creating a new user. */
  openNewForm() {
    this._editingId = null;
    this.modal.setTitle('Novo Usuário');
    $('user-form').reset();
    $('user-password').setAttribute('placeholder', '••••••••');
    $('user-password').required = true;
    $('user-password-hint').classList.add('hidden');
    $('user-form-error').classList.add('hidden');
    this.modal.open();
  }

  /** Opens modal for editing an existing user. */
  openEditForm(user) {
    this._editingId = user._id || user.id;
    this.modal.setTitle(`Editando: ${user.username}`);
    $('user-username').value = user.username;
    $('user-password').value = '';
    $('user-password').removeAttribute('required');
    $('user-password').setAttribute('placeholder', 'Nova senha (opcional)');
    $('user-password-hint').classList.remove('hidden');
    $('user-form-error').classList.add('hidden');
    this.modal.open();
  }

  /** Toggles modal open for creating. */
  toggleForm() {
    if (this.modal.isOpen()) {
      this.modal.close();
    } else {
      this.openNewForm();
    }
  }

  resetForm() {
    $('user-form').reset();
    $('user-form-error').classList.add('hidden');
  }

  closeModal() {
    this.modal.close();
  }

  showFormError(msg) {
    const el = $('user-form-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }
}
