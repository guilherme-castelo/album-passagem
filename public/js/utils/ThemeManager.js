/**
 * ThemeManager — generic engine for UI customization.
 * Applies CSS variables, loads fonts, and manages dynamic labels.
 */
export class ThemeManager {
  /**
   * Applies the UI configuration to the page.
   * @param {Object} config - The uiConfig object.
   */
  static apply(config) {
    if (!config) return;

    this._applyColors(config.palette);
    this._applyTypography(config.typography);
    this._applyVisualTokens(config.visualTokens);
    this._applyLabels(config.labels);
    this._applyLayout(config.layout, config.branding);

    // Live preview listener
    this._setupPreviewListener();
  }

  static _setupPreviewListener() {
    if (this._listenerReady) return;
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (data && data.type === 'UI_CONFIG_UPDATE') {
        this.apply(data.config);
      }
    });
    this._listenerReady = true;
  }

  /**
   * Maps palette to CSS variables.
   */
  static _applyColors(palette) {
    if (!palette) return;
    const root = document.documentElement;

    const mapping = {
      primary: '--color-primary',
      accent: '--color-accent',
      background: '--color-background',
      text: '--color-text',
      muted: '--color-text-muted'
    };

    Object.entries(palette).forEach(([key, color]) => {
      if (mapping[key] && color) {
        root.style.setProperty(mapping[key], color);
      }
    });

    // Handle surface and border based on background
    if (palette.background) {
      root.style.setProperty('--color-surface', palette.background);
      document.body.style.backgroundColor = palette.background;
    }
  }

  /**
   * Applies typography variables and loads fonts.
   */
  static _applyTypography(typography) {
    if (!typography) return;
    const root = document.documentElement;

    const fonts = {
      body: '--font-body',
      heading: '--font-heading',
      mono: '--font-mono'
    };

    Object.entries(typography).forEach(([key, font]) => {
      if (fonts[key] && font) {
        const fontName = font.split(':')[0];
        root.style.setProperty(fonts[key], `'${fontName}', sans-serif`);
      }
    });

    this._loadGoogleFonts(typography);
  }

  static _loadGoogleFonts(typography) {
    const families = [typography.heading, typography.body, typography.mono]
      .filter(Boolean)
      .map((f) => f.replace(/\s+/g, '+'))
      .join('&family=');

    if (!families) return;

    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  }

  /**
   * Maps visual tokens to CSS variables.
   */
  static _applyVisualTokens(tokens = {}) {
    const root = document.documentElement;
    if (tokens.borderRadius) {
      root.style.setProperty('--radius-md', tokens.borderRadius);
      const val = parseInt(tokens.borderRadius);
      root.style.setProperty('--radius-sm', `${val / 2}px`);
      root.style.setProperty('--radius-lg', `${val * 1.5}px`);
    }
    if (tokens.shadowLevel) {
      root.style.setProperty('--shadow-md', tokens.shadowLevel);
    }
  }

  /**
   * Updates text in data-label elements.
   */
  static _applyLabels(labels) {
    if (!labels) return;
    document.querySelectorAll('[data-label]').forEach((el) => {
      const key = el.dataset.label;
      if (labels[key]) el.textContent = labels[key];
    });
  }

  /**
   * Controls layout order and branding.
   */
  static _applyLayout(layout, branding) {
    if (branding?.title) {
      document.title = branding.title;
      const titleEl = document.getElementById('album-title');
      if (titleEl) titleEl.textContent = branding.title;
    }

    if (branding?.subtitle) {
      const subEl = document.getElementById('artist-name');
      if (subEl) subEl.textContent = branding.subtitle;
    }

    if (branding?.logo) {
      const logoImg = document.getElementById('album-logo');
      if (logoImg) {
        logoImg.src = branding.logo;
        logoImg.classList.remove('hidden');
      }
    }

    if (layout?.sectionsOrder) {
      this._reorderSections(layout.sectionsOrder);
    }
  }

  static _reorderSections(order) {
    const container = document.getElementById('view-container');
    if (!container || !order) return;

    const sections = {
      hero: document.querySelector('header'),
      tracklist: document.getElementById('view-tracklist'),
      lyrics: document.getElementById('view-lyrics'),
      media: document.getElementById('media-container')
    };

    order.forEach((key) => {
      const el = sections[key];
      if (el && key !== 'hero') container.appendChild(el);
    });
  }
}
