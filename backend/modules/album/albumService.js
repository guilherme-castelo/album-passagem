const albumRepository = require('./albumRepository');

// Dados padrão caso o álbum ainda não exista no MongoDB
const DEFAULT_ALBUM = {
    title: 'Passagem',
    artist: 'Bruno',
    event: 'Pré-lançamento Teatro Belas Artes',
    date: '2026-03-18T20:00:00-04:00'
};

const ALLOWED_FIELDS = ['title', 'artist', 'event', 'date'];

class AlbumService {
    async getAlbum() {
        const album = await albumRepository.findOne();
        // Se não existir no banco, retorna o padrão
        return album || DEFAULT_ALBUM;
    }

    async updateAlbum(data) {
        const sanitized = {};
        ALLOWED_FIELDS.forEach(field => {
            if (data[field] !== undefined) sanitized[field] = data[field];
        });

        if (Object.keys(sanitized).length === 0) {
            throw new Error('Nenhum campo válido para atualização.');
        }

        return albumRepository.updateOne(sanitized);
    }
}

module.exports = new AlbumService();
