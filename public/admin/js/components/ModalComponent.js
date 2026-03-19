/**
 * ModalComponent — Reusable dark modal with header, body, and footer.
 *
 * Usage:
 *   const modal = new ModalComponent({
 *     title: 'Nova Faixa',
 *     onClose: () => modal.close()
 *   });
 *   modal.setBody(htmlString);
 *   modal.setFooter(htmlString);
 *   modal.open();
 */
export class ModalComponent {
  /**
   * @param {Object} opts
   * @param {string} opts.title
   * @param {string} [opts.size='md'] — 'sm' (24rem), 'md' (36rem), 'lg' (48rem)
   * @param {Function} [opts.onClose]
   */
  constructor(opts = {}) {
    this.title = opts.title || '';
    this.size = opts.size || 'md';
    this.onClose = opts.onClose || null;
    this._build();
  }

  _build() {
    const maxWidths = { sm: '24rem', md: '36rem', lg: '48rem' };

    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.style.display = 'none';

    this.panel = document.createElement('div');
    this.panel.className = 'modal-panel';
    this.panel.style.maxWidth = maxWidths[this.size] || maxWidths.md;

    this.panel.innerHTML = `
      <div class="modal-header">
        <h3 class="font-bold text-white text-base flex items-center gap-2 tracking-wide"></h3>
        <button class="modal-close-btn text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer" style="display:none"></div>
    `;

    this.headerTitle = this.panel.querySelector('.modal-header h3');
    this.bodyEl = this.panel.querySelector('.modal-body');
    this.footerEl = this.panel.querySelector('.modal-footer');

    this.headerTitle.textContent = this.title;

    this.overlay.appendChild(this.panel);
    document.body.appendChild(this.overlay);

    // Close on X
    this.panel.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    // Close on Escape
    this._escHandler = (e) => { if (e.key === 'Escape') this.close(); };
  }

  setTitle(title) {
    this.headerTitle.textContent = title;
  }

  setBody(html) {
    this.bodyEl.innerHTML = html;
  }

  getBodyElement() {
    return this.bodyEl;
  }

  setFooter(html) {
    this.footerEl.innerHTML = html;
    this.footerEl.style.display = html ? '' : 'none';
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.bodyEl.classList.add('modal-loading-skeletons');
      this.footerEl.querySelectorAll('button').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
      });
    } else {
      this.bodyEl.classList.remove('modal-loading-skeletons');
      this.footerEl.querySelectorAll('button').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
      });
    }
  }

  open() {
    this.overlay.style.display = '';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._escHandler);
  }

  close() {
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._escHandler);
    if (this.onClose) this.onClose();
  }

  isOpen() {
    return this.overlay.style.display !== 'none';
  }

  destroy() {
    document.removeEventListener('keydown', this._escHandler);
    this.overlay.remove();
  }
}
