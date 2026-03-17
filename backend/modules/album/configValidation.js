/**
 * uiConfig Validation & Defaults
 * Defines the structure and rules for album visual customization.
 */

const DEFAULT_UI_CONFIG = {
  theme: 'minimal',
  palette: {
    primary: '#000000',
    accent: '#3b82f6',
    background: '#ffffff',
    text: '#0f172a',
    muted: '#64748b'
  },
  typography: { heading: 'Inter', body: 'Inter', mono: 'ui-monospace' },
  layout: {
    sectionsOrder: ['hero', 'tracklist', 'lyrics', 'media'],
    trackDisplay: 'list',
    showLyrics: true,
    showMedia: true
  },
  visualTokens: {
    borderRadius: '8px',
    shadowLevel: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  },
  labels: {
    passengerLabel: 'Seu Nome',
    trackCode: '#',
    trackTag: 'Tag',
    fromLabel: 'De',
    toLabel: 'Para',
    cta: 'Começar',
    skipCheckin: 'Pular',
    loadingMsg: 'Carregando...',
    tracklistTitle: 'Faixas',
    trackUnit: 'Nº',
    tracklistUnit: 'Músicas',
    backBtn: 'Voltar',
    mediaTitle: 'Mídia',
    footerThanks: 'Obrigado pela visita',
    stampText: 'OK'
  },
  branding: { title: 'Album Player', subtitle: '', logo: '', footer: '' }
};

/**
 * Validates and sanitizes a uiConfig object.
 * @param {Object} config - The incoming config object to validate.
 * @param {Object} [baseConfig] - Optional existing config to merge into.
 * @returns {Object} - Sanitized and merged config object.
 */
function validateUiConfig(config, baseConfig) {
  if (!config || typeof config !== 'object') return baseConfig || { ...DEFAULT_UI_CONFIG };

  const sanitized = baseConfig
    ? JSON.parse(JSON.stringify(baseConfig))
    : JSON.parse(JSON.stringify(DEFAULT_UI_CONFIG));

  // Theme
  if (['ticket', 'minimal', 'glass', 'neo'].includes(config.theme)) {
    sanitized.theme = config.theme;
  }

  // Palette (Handle both 'palette' and legacy 'colors')
  const paletteSource = config.palette || config.colors;
  if (paletteSource && typeof paletteSource === 'object') {
    sanitized.palette = { ...sanitized.palette };
    const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
    ['primary', 'accent', 'background', 'text', 'muted'].forEach((key) => {
      if (paletteSource[key] && hexRegex.test(paletteSource[key])) {
        sanitized.palette[key] = paletteSource[key];
      }
    });
  }

  // Typography
  if (config.typography && typeof config.typography === 'object') {
    sanitized.typography = { ...sanitized.typography };
    ['heading', 'body', 'mono'].forEach((key) => {
      if (typeof config.typography[key] === 'string') {
        sanitized.typography[key] = config.typography[key].substring(0, 50);
      }
    });
  }

  // Visual Tokens
  if (config.visualTokens && typeof config.visualTokens === 'object') {
    sanitized.visualTokens = { ...sanitized.visualTokens };
    if (typeof config.visualTokens.borderRadius === 'string') {
      sanitized.visualTokens.borderRadius = config.visualTokens.borderRadius.substring(0, 20);
    }
    if (typeof config.visualTokens.shadowLevel === 'string') {
      sanitized.visualTokens.shadowLevel = config.visualTokens.shadowLevel.substring(0, 100);
    }
  }

  // Layout
  if (config.layout && typeof config.layout === 'object') {
    sanitized.layout = { ...sanitized.layout };
    if (Array.isArray(config.layout.sectionsOrder)) {
      sanitized.layout.sectionsOrder = config.layout.sectionsOrder.filter(
        (s) => typeof s === 'string'
      );
    }
    if (['list', 'grid', 'compact'].includes(config.layout.trackDisplay)) {
      sanitized.layout.trackDisplay = config.layout.trackDisplay;
    }
    ['showLyrics', 'showMedia'].forEach((key) => {
      if (typeof config.layout[key] === 'boolean') {
        sanitized.layout[key] = config.layout[key];
      }
    });
  }

  // Labels
  if (config.labels && typeof config.labels === 'object') {
    sanitized.labels = { ...sanitized.labels };
    Object.keys(sanitized.labels).forEach((key) => {
      if (typeof config.labels[key] === 'string') {
        sanitized.labels[key] = config.labels[key].substring(0, 100);
      }
    });
  }

  // Branding
  if (config.branding && typeof config.branding === 'object') {
    sanitized.branding = { ...sanitized.branding };
    ['title', 'subtitle', 'logo', 'footer'].forEach((key) => {
      if (typeof config.branding[key] === 'string') {
        const max = key === 'footer' ? 500 : 200;
        sanitized.branding[key] = config.branding[key].substring(0, max);
      }
    });
  }

  return sanitized;
}

module.exports = {
  DEFAULT_UI_CONFIG,
  validateUiConfig
};
