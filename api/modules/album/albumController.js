const albumService = require('./albumService');
const { sendSuccess, sendError, sendMethodNotAllowed } = require('../../lib/response');

const albumController = {
    async get(req, res) {
        try {
            const album = await albumService.getAlbum();
            return sendSuccess(res, album);
        } catch (err) {
            return sendError(res, 500, 'Erro ao carregar dados do álbum.');
        }
    },

    async update(req, res) {
        try {
            const updated = await albumService.updateAlbum(req.body);
            return sendSuccess(res, updated);
        } catch (err) {
            return sendError(res, 400, err.message);
        }
    }
};

module.exports = albumController;
