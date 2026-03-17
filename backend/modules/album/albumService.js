const albumRepository = require('./albumRepository');
const { DEFAULT_UI_CONFIG, validateUiConfig } = require('./configValidation');

// Dados padrão caso nenhum álbum exista no MongoDB
const DEFAULT_ALBUM = {
  title: 'Example Album',
  artist: 'Artist Example',
  event: 'Launch Event',
  date: new Date().toISOString(),
  uiConfig: DEFAULT_UI_CONFIG
};

const ALLOWED_FIELDS = ['title', 'artist', 'event', 'date', 'uiConfig'];

class AlbumService {
  async listAlbums() {
    return albumRepository.findAll();
  }

  async getAlbum(id) {
    if (!id) return DEFAULT_ALBUM;
    const album = await albumRepository.findById(id);
    if (!album) return DEFAULT_ALBUM;

    // Garante que o álbum retornado tenha o uiConfig preenchido (merge com defaults)
    return {
      ...album,
      uiConfig: validateUiConfig(album.uiConfig)
    };
  }

  async createAlbum(data) {
    const sanitized = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (data[field] !== undefined) {
        if (field === 'uiConfig') {
          sanitized[field] = validateUiConfig(data[field]);
        } else {
          sanitized[field] = data[field];
        }
      }
    });
    if (!sanitized.uiConfig) sanitized.uiConfig = DEFAULT_UI_CONFIG;

    return albumRepository.create(sanitized);
  }

  async updateAlbum(id, data) {
    const existing = await this.getAlbum(id);
    const sanitized = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (data[field] !== undefined) {
        if (field === 'uiConfig') {
          sanitized[field] = validateUiConfig(data[field], existing.uiConfig);
        } else {
          sanitized[field] = data[field];
        }
      }
    });

    if (Object.keys(sanitized).length === 0) {
      throw new Error('Nenhum campo válido para atualização.');
    }

    return albumRepository.update(id, sanitized);
  }

  async deleteAlbum(id) {
    return albumRepository.delete(id);
  }
}

module.exports = new AlbumService();
