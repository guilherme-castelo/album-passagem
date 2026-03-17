const trackRepository = require('./trackRepository');

const REQUIRED_FIELDS = ['title', 'gate', 'flightCode'];
const ALLOWED_STATUSES = ['ON TIME', 'DELAYED', 'FINAL CALL', 'BOARDING'];

class TrackService {
  // ─── Público ────────────────────────────────────────────────────────────────

  // ─── Leitura ────────────────────────────────────────────────────────────────

  async list(filters = {}) {
    return trackRepository.findAll(filters);
  }

  async findById(id) {
    const track = await trackRepository.findById(id);
    if (!track) throw new Error('Faixa não encontrada.');
    return track;
  }

  // ─── Admin CRUD ─────────────────────────────────────────────────────────────

  async create(data) {
    this._validateRequired(data);
    this._validateStatus(data.status);
    const track = this._buildTrackDoc(data);
    return trackRepository.create(track);
  }

  async update(id, data) {
    await this.findById(id);
    const { _id: _, interactions: __, ...safe } = data;
    return trackRepository.update(id, safe);
  }

  async updateOrder(albumId, trackIds) {
    if (!albumId || !Array.isArray(trackIds)) {
      throw new Error('Parâmetros inválidos para reordenação.');
    }

    const updates = trackIds.map((id, index) => {
      const order = index + 1;
      const flightCode = `PSG${String(order).padStart(2, '0')}`;
      return trackRepository.update(id, { order, flightCode });
    });

    await Promise.all(updates);
    return { success: true };
  }

  async delete(id) {
    const deleted = await trackRepository.delete(id);
    if (!deleted) throw new Error('Faixa não encontrada.');
    return { deleted: true };
  }

  // ─── Interações Públicas ────────────────────────────────────────────────────

  toggleLike(track, action) {
    let likes = track.interactions?.likes || 0;
    return action === 'unlike' ? Math.max(0, likes - 1) : likes + 1;
  }

  submitRating(track, rating, oldRating) {
    let ratings = [...(track.interactions?.ratings || [])];
    if (oldRating) {
      const idx = ratings.indexOf(oldRating);
      if (idx !== -1) ratings.splice(idx, 1);
    }
    ratings.push(rating);
    return ratings;
  }

  // ─── Helpers Privados ────────────────────────────────────────────────────────

  _validateRequired(data) {
    for (const field of REQUIRED_FIELDS) {
      if (!data[field]) throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  _validateStatus(status) {
    if (status && !ALLOWED_STATUSES.includes(status)) {
      throw new Error(`Status inválido. Use: ${ALLOWED_STATUSES.join(', ')}`);
    }
  }

  _buildTrackDoc(data) {
    return {
      gate: data.gate,
      flightCode: data.flightCode,
      title: data.title,
      status: data.status || 'ON TIME',
      lyrics: data.lyrics || '',
      media: Array.isArray(data.media) ? data.media : [],
      interactions: { likes: 0, ratings: [] }
    };
  }
}

module.exports = new TrackService();
