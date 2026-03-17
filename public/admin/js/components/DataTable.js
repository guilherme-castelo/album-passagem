/**
 * DataTable — Reusable glass-styled table component.
 *
 * Usage:
 * const table = new DataTable(containerEl, {
 *   columns: [
 *     { key: 'name', label: 'Nome' },
 *     { key: 'date', label: 'Data', render: (val) => formatDate(val) }
 *   ],
 *   actions: [
 *     { label: 'Editar', variant: 'ghost', onClick: (row) => ... },
 *     { label: 'Excluir', variant: 'danger', onClick: (row) => ... }
 *   ],
 *   emptyMessage: 'Nenhum item encontrado.'
 * });
 *
 * table.setData(rows);
 * table.setLoading(true);
 */
export class DataTable {
  /**
   * @param {HTMLElement} container — element to render into
   * @param {Object} config
   */
  constructor(container, config) {
    this.container = container;
    this.columns = config.columns || [];
    this.actions = config.actions || [];
    this.emptyMessage = config.emptyMessage || 'Nenhum dado encontrado.';
    this.minWidth = config.minWidth || '600px';
    this._data = [];
    this._render();
  }

  _render() {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className =
      'glass rounded-2xl shadow-xl overflow-hidden overflow-x-auto border border-white/20';

    const table = document.createElement('table');
    table.className = 'glass-table';
    table.style.minWidth = this.minWidth;

    // Head
    const thead = document.createElement('thead');
    let headHtml = '<tr>';
    this.columns.forEach((col) => {
      headHtml += `<th>${col.label}</th>`;
    });
    if (this.actions.length) headHtml += '<th>Ações</th>';
    headHtml += '</tr>';
    thead.innerHTML = headHtml;
    table.appendChild(thead);

    // Body
    this.tbody = document.createElement('tbody');
    table.appendChild(this.tbody);

    wrapper.appendChild(table);
    this.container.appendChild(wrapper);

    this._renderBody();
  }

  _renderBody() {
    if (this._loading) {
      this.tbody.innerHTML = `<tr><td colspan="${this.columns.length + (this.actions.length ? 1 : 0)}" class="text-center py-8 text-blue-300">
        <div class="flex items-center justify-center gap-2">
          <div class="w-5 h-5 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin"></div>
          <span>Carregando...</span>
        </div>
      </td></tr>`;
      return;
    }

    if (!this._data.length) {
      this.tbody.innerHTML = `<tr><td colspan="${this.columns.length + (this.actions.length ? 1 : 0)}" class="text-center py-8 text-blue-300/60">
        <div class="flex flex-col items-center gap-2">
          <svg class="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
          <span>${this.emptyMessage}</span>
        </div>
      </td></tr>`;
      return;
    }

    this.tbody.innerHTML = this._data
      .map((row) => {
        let html = '<tr>';
        this.columns.forEach((col) => {
          const val = row[col.key];
          const rendered = col.render ? col.render(val, row) : (val ?? '--');
          html += `<td class="${col.className || ''}">${rendered}</td>`;
        });

        if (this.actions.length) {
          html += '<td><div class="flex items-center gap-2">';
          this.actions.forEach((action, i) => {
            const btnClass = action.variant === 'danger' ? 'btn-danger' : 'btn-ghost';
            html += `<button class="${btnClass}" data-action="${i}" data-row-id="${row._id || row.id}">${action.label}</button>`;
          });
          html += '</div></td>';
        }
        html += '</tr>';
        return html;
      })
      .join('');

    // Bind action clicks
    this.tbody.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const actionIndex = parseInt(btn.dataset.action);
        const rowId = btn.dataset.rowId;
        const row = this._data.find((r) => String(r._id || r.id) === rowId);
        if (row && this.actions[actionIndex]) {
          this.actions[actionIndex].onClick(row);
        }
      });
    });
  }

  /** Update the table data. */
  setData(rows) {
    this._data = rows;
    this._loading = false;
    this._renderBody();
  }

  /** Show loading spinner. */
  setLoading(loading) {
    this._loading = loading;
    this._renderBody();
  }
}
