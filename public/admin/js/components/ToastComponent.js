/**
 * ToastComponent — Animated notification system.
 * Usage: toast.show('Message', 'success') or toast.show('Error!', 'error')
 */
import { createElement } from '../utils/dom.js';

class ToastManager {
  constructor() {
    this._container = null;
  }

  _ensureContainer() {
    if (this._container) return;
    this._container = createElement('div', { className: 'toast-container' });
    document.body.appendChild(this._container);
  }

  /**
   * Shows a toast notification.
   * @param {string} message 
   * @param {'success'|'error'} type 
   * @param {number} duration — ms before auto-dismiss
   */
  show(message, type = 'success', duration = 3000) {
    this._ensureContainer();

    const iconSvg = type === 'success'
      ? '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
      : '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';

    const toastEl = createElement('div', {
      className: `toast toast-${type}`,
      html: `${iconSvg}<span>${message}</span>`
    });

    this._container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.add('toast-out');
      toastEl.addEventListener('animationend', () => toastEl.remove());
    }, duration);
  }

  success(msg, duration) { this.show(msg, 'success', duration); }
  error(msg, duration) { this.show(msg, 'error', duration); }
}

export const toast = new ToastManager();
