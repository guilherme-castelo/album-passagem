const trackService = require('./trackService');
const trackRepository = require('./trackRepository');
const { sendSuccess, sendError, sendNotFound } = require('../../lib/response');

const trackController = {
    // GET /api/tracks (admin)
    async list(req, res) {
        try {
            const tracks = await trackService.getAllPublic();
            return sendSuccess(res, tracks);
        } catch (err) {
            return sendError(res, 500, 'Erro ao listar faixas.');
        }
    },

    // GET /api/tracks/:id (admin)
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id || req.query.id || req.vercelParams?.id, 10);
            if (isNaN(id)) return sendError(res, 400, 'ID inválido.');
            const track = await trackService.findById(id);
            return sendSuccess(res, track);
        } catch (err) {
            return sendNotFound(res, err.message);
        }
    },

    // POST /api/tracks (admin)
    async create(req, res) {
        try {
            const track = await trackService.create(req.body);
            return sendSuccess(res, track, 201);
        } catch (err) {
            return sendError(res, 400, err.message);
        }
    },

    // PUT /api/tracks/:id (admin)
    async update(req, res) {
        try {
            const id = parseInt(req.params.id || req.query.id, 10);
            if (isNaN(id)) return sendError(res, 400, 'ID inválido.');
            const track = await trackService.update(id, req.body);
            return sendSuccess(res, track);
        } catch (err) {
            return sendError(res, 400, err.message);
        }
    },

    // DELETE /api/tracks/:id (admin)
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id || req.query.id, 10);
            if (isNaN(id)) return sendError(res, 400, 'ID inválido.');
            const result = await trackService.delete(id);
            return sendSuccess(res, result);
        } catch (err) {
            return sendNotFound(res, err.message);
        }
    },

    // POST /api/tracks/:id/like (público)
    async like(req, res) {
        try {
            const id = parseInt(req.params.id || req.vercelParams?.id, 10);
            if (isNaN(id)) return sendError(res, 400, 'ID inválido.');

            const { action } = req.body;
            const track = await trackService.findById(id);
            const newLikes = trackService.toggleLike(track, action);
            await trackRepository.updateLikes(id, newLikes);
            return sendSuccess(res, { likes: newLikes });
        } catch (err) {
            return sendNotFound(res, err.message);
        }
    },

    // POST /api/tracks/:id/rate (público)
    async rate(req, res) {
        try {
            const id = parseInt(req.params.id || req.vercelParams?.id, 10);
            if (isNaN(id)) return sendError(res, 400, 'ID inválido.');

            const { rating, oldRating } = req.body;
            if (!rating || rating < 1 || rating > 5) return sendError(res, 400, 'Rating inválido (1-5).');

            const track = await trackService.findById(id);
            const newRatings = trackService.submitRating(track, rating, oldRating);
            await trackRepository.updateRatings(id, newRatings);
            return sendSuccess(res, { ratings: newRatings, success: true });
        } catch (err) {
            return sendNotFound(res, err.message);
        }
    }
};

module.exports = trackController;
