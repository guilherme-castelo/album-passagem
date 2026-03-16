/**
 * ConfirmDialog — Glassmorphic confirmation modal.
 * Replaces native window.confirm() with a styled async dialog.
 *
 * Usage:
 *   const ok = await confirmDialog.show({
 *     title: 'Excluir faixa?',
 *     message: 'Essa ação não pode ser desfeita.',
 *     confirmText: 'Excluir',
 *     cancelText: 'Cancelar'
 *   });
 *   if (ok) { ... }
 */
class ConfirmDialogManager {
  /**
   * @param {Object} opts
   * @param {string} opts.title
   * @param {string} opts.message
   * @param {string} [opts.confirmText='Confirmar']
   * @param {string} [opts.cancelText='Cancelar']
   * @returns {Promise<boolean>}
   */
  show({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
    return new Promise(resolve => {
      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';

      // Panel
      overlay.innerHTML = `
        <div class="dialog-panel">
          <h3 class="text-lg font-bold text-white mb-2">${title}</h3>
          <p class="text-blue-200 text-sm mb-6 leading-relaxed">${message}</p>
          <div class="flex items-center gap-3 justify-end">
            <button id="dialog-cancel" class="btn-ghost">${cancelText}</button>
            <button id="dialog-confirm" class="btn-danger" style="padding: 0.5rem 1.25rem; font-size: 0.8rem;">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const cleanup = (result) => {
        overlay.remove();
        resolve(result);
      };

      overlay.querySelector('#dialog-confirm').addEventListener('click', () => cleanup(true));
      overlay.querySelector('#dialog-cancel').addEventListener('click', () => cleanup(false));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(false);
      });
    });
  }
}

export const confirmDialog = new ConfirmDialogManager();
