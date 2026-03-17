/**
 * uiConfig Validation & Defaults
 * Defines the structure and rules for album visual customization.
 */

const DEFAULT_UI_CONFIG = {
  theme: 'default',
  colors: {
    primary: '#0F2C59',
    accent: '#F9B572',
    background: '#0a0f1a',
    text: '#ffffff',
    muted: '#94a3b8'
  },
  typography: { heading: 'Inter', body: 'Inter', mono: 'Roboto Mono' },
  layout: {
    sections: ['hero', 'tracklist', 'lyrics'],
    trackDisplay: 'list',
    showInteractions: true,
    showLyrics: true,
    showMedia: true
  },
  labels: {
    trackCode: 'Track',
    trackTag: 'Tag',
    statuses: ['Published', 'Draft', 'Featured', 'Hidden'],
    cta: 'Listen Now'
  },
  branding: { title: '', subtitle: '', logo: '', footer: '' }
};

/**
 * Validates and sanitizes a uiConfig object.
 * @param {Object} config - The incoming config object to validate.
 * @param {Object} [baseConfig] - Optional existing config to merge into.
 * @returns {Object} - Sanitized and merged config object.
 */
function validateUiConfig(config, baseConfig) {
  if (!config || typeof config !== 'object') return baseConfig || { ...DEFAULT_UI_CONFIG };

  const sanitized = baseConfig ? { ...baseConfig } : { ...DEFAULT_UI_CONFIG };

  // Theme
  if (['default', 'dark', 'light', 'custom'].includes(config.theme)) {
    sanitized.theme = config.theme;
  }

  // Colors
  if (config.colors && typeof config.colors === 'object') {
    sanitized.colors = { ...sanitized.colors };
    const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
    ['primary', 'accent', 'background', 'text', 'muted'].forEach((key) => {
      if (config.colors[key] && hexRegex.test(config.colors[key])) {
        sanitized.colors[key] = config.colors[key];
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

  // Layout
  if (config.layout && typeof config.layout === 'object') {
    sanitized.layout = { ...sanitized.layout };
    if (Array.isArray(config.layout.sections)) {
      sanitized.layout.sections = config.layout.sections.filter((s) => typeof s === 'string');
    }
    if (['list', 'grid'].includes(config.layout.trackDisplay)) {
      sanitized.layout.trackDisplay = config.layout.trackDisplay;
    }
    ['showInteractions', 'showLyrics', 'showMedia'].forEach((key) => {
      if (typeof config.layout[key] === 'boolean') {
        sanitized.layout[key] = config.layout[key];
      }
    });
  }

  // Labels
  if (config.labels && typeof config.labels === 'object') {
    sanitized.labels = { ...sanitized.labels };
    ['trackCode', 'trackTag', 'cta'].forEach((key) => {
      if (typeof config.labels[key] === 'string') {
        sanitized.labels[key] = config.labels[key].substring(0, 50);
      }
    });
    if (Array.isArray(config.labels.statuses)) {
      sanitized.labels.statuses = config.labels.statuses.filter((s) => typeof s === 'string');
    }
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
