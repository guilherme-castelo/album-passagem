/**
 * UsersView — Users table + modal form for create/edit.
 */
import { $ } from '../utils/dom.js';
import { DataTable } from '../components/DataTable.js';
import { BaseFormModal } from '../components/BaseFormModal.js';
import { formatDate } from '../utils/dom.js';

export class UsersView {
  constructor(ids) {
    this.tableContainerEl = $(ids.tableContainer);
    this.formContainerEl = $(ids.formContainer);

    /** @type {Function|null} (userData, id?) => void */
    this.onSave = null;
    /** @type {Function|null} (id, username) => void */
    this.onDelete = null;

    this._buildTable();
    this.form = new UserFormModal();
    this.form.onSave = (data, id) => { if(this.onSave) this.onSave(data, id); };
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
        { label: 'Editar', variant: 'ghost', onClick: (row) => this.form.populate(row) },
        { label: 'Excluir', variant: 'danger', onClick: (row) => { if (this.onDelete) this.onDelete(row._id || row.id, row.username); } }
      ],
      emptyMessage: 'Nenhum usuário admin.',
      minWidth: '400px'
    });
  }

  setTableData(users) { this.table.setData(users); }
  setTableLoading(loading) { this.table.setLoading(loading); }

  toggleForm() {
    if (this.form.modal.isOpen()) this.form.close();
    else this.form.openNew();
  }

  closeModal() { this.form.close(); }
  showFormError(msg) { this.form.showError(msg); }
}

class UserFormModal extends BaseFormModal {
  constructor() {
    super({
      titleNew: 'Novo Usuário',
      titleEdit: (data) => `Editando: ${data.username}`,
      size: 'sm',
      saveBtnText: 'Salvar'
    });
  }

  _getFormHtml() {
    return `
      <form id="user-form" class="space-y-4">
        <div>
          <label class="label">Nome de Usuário</label>
          <input type="text" id="user-username" placeholder="username" class="glass-input" required />
        </div>
        <div>
          <label class="label">Senha</label>
          <input type="password" id="user-password" placeholder="••••••••" class="glass-input" />
          <p id="user-password-hint" class="text-xs mt-1 hidden" style="color: var(--text-muted)">Deixe em branco para manter a senha atual.</p>
        </div>
      </form>
    `;
  }

  _getFormValues() {
    return {
      username: $('user-username').value.trim(),
      password: $('user-password').value
    };
  }

  onReset() {
    const form = $('user-form');
    if (form) form.reset();
    $('user-password').setAttribute('placeholder', '••••••••');
    $('user-password').required = true;
    $('user-password-hint').classList.add('hidden');
  }

  onPopulate(user) {
    $('user-username').value = user.username;
    $('user-password').value = '';
    $('user-password').removeAttribute('required');
    $('user-password').setAttribute('placeholder', 'Nova senha (opcional)');
    $('user-password-hint').classList.remove('hidden');
  }
}
