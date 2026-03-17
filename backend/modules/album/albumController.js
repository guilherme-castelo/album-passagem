const albumService = require('./albumService');
const { sendSuccess, sendError, sendMethodNotAllowed } = require('../../lib/response');

const albumController = {
    async list(req, res) {
        try {
            const albums = await albumService.listAlbums();
            return sendSuccess(res, albums);
        } catch (err) {
            return sendError(res, 500, 'Erro ao listar álbuns.');
        }
    },

    async getById(req, res) {
        try {
            const id = req.params.id || req.query.id || req.vercelParams?.id;
            const album = await albumService.getAlbum(id);
            return sendSuccess(res, album);
        } catch (err) {
            return sendError(res, 500, 'Erro ao carregar dados do álbum.');
        }
    },

    async create(req, res) {
        try {
            const album = await albumService.createAlbum(req.body);
            return sendSuccess(res, album, 201);
        } catch (err) {
            return sendError(res, 400, err.message);
        }
    },

    async update(req, res) {
        try {
            const id = req.params.id || req.query.id || req.vercelParams?.id;
            const updated = await albumService.updateAlbum(id, req.body);
            return sendSuccess(res, updated);
        } catch (err) {
            return sendError(res, 400, err.message);
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id || req.query.id || req.vercelParams?.id;
            const result = await albumService.deleteAlbum(id);
            return sendSuccess(res, result);
        } catch (err) {
            return sendError(res, 400, err.message);
        }
    }
};

module.exports = albumController;
