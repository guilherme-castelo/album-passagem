const trackController = require('../../backend/modules/tracks/trackController');
const applyCors = require('../../backend/lib/cors');
const { sendError, sendMethodNotAllowed, sendSuccess } = require('../../backend/lib/response');
const trackRepository = require('../../backend/repositories/trackRepository');
const trackService = require('../../backend/services/trackService');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;

    let path = req.query.path || req.vercelPath || []; // /api/musicas/:id/like -> ['123', 'like']
    if (typeof path === 'string') path = path.split('/').filter(Boolean);

    const id = path[0];
    const action = path[1];

    // Inject para retrocompatibilidade com o trackController
    req.params = req.params || {};
    if (id) req.params.id = id;

    console.log(`[MusicasHandler] id: ${id}, action: ${action}, method: ${req.method}`);

    try {
        if (req.method === 'GET') {
            const albumData = trackService.getAlbumInfo();
            const tracks = await trackRepository.findAll();

            return sendSuccess(res, {
                album: albumData,
                tracks: tracks
            });
        }

        if (req.method === 'POST') {
            if (id && action === 'like') return await trackController.like(req, res);
            if (id && action === 'rate') return await trackController.rate(req, res);
        }

        return sendMethodNotAllowed(res);
    } catch (error) {
        console.error('API Error [Musicas]:', error);
        return sendError(res, 500, "Erro interno do servidor.");
    }
};
