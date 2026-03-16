/**
 * SidebarComponent — Navigation sidebar with mobile toggle.
 */
import { $, $$ } from '../utils/dom.js';
import { auth } from '../utils/auth.js';

export class SidebarComponent {
  /**
   * @param {Object} ids — DOM element IDs
   * @param {string} ids.sidebar
   * @param {string} ids.overlay
   * @param {string} ids.username
   */
  constructor(ids) {
    this.sidebar = $(ids.sidebar);
    this.overlay = $(ids.overlay);
    this.usernameEl = $(ids.username);

    /** @type {Function|null} */
    this.onNavigate = null;
    /** @type {Function|null} */
    this.onLogout = null;

    this._init();
  }

  _init() {
    // Display username
    if (this.usernameEl) {
      this.usernameEl.textContent = auth.getUsername();
    }

    // Overlay click closes sidebar
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    // Nav links
    $$('.sidebar-nav-link', this.sidebar).forEach(link => {
      link.addEventListener('click', () => {
        const section = link.dataset.section;
        if (section && this.onNavigate) {
          this.onNavigate(section);
          this._closeMobile();
        }
      });
    });

    // Logout
    const logoutBtn = this.sidebar.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (this.onLogout) this.onLogout();
      });
    }
  }

  /** Sets the active section in the sidebar. */
  setActive(sectionName) {
    $$('.sidebar-nav-link', this.sidebar).forEach(link => {
      link.classList.toggle('active', link.dataset.section === sectionName);
    });
  }

  /** Opens the sidebar (mobile). */
  open() {
    this.sidebar.classList.add('open');
    this.sidebar.classList.remove('-translate-x-full');
    if (this.overlay) this.overlay.classList.remove('hidden');
  }

  /** Closes the sidebar (mobile). */
  close() {
    this.sidebar.classList.remove('open');
    this.sidebar.classList.add('-translate-x-full');
    if (this.overlay) this.overlay.classList.add('hidden');
  }

  /** Toggles the sidebar (mobile). */
  toggle() {
    if (this.sidebar.classList.contains('open') || !this.sidebar.classList.contains('-translate-x-full')) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Closes sidebar only on mobile viewports. */
  _closeMobile() {
    if (window.innerWidth < 1024) {
      this.close();
    }
  }
}
