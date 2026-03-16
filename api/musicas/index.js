const applyCors = require('../lib/cors');
const { sendError, sendMethodNotAllowed, sendSuccess } = require('../lib/response');
const trackRepository = require('../repositories/trackRepository');
const trackService = require('../services/trackService');

module.exports = async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method === 'GET') {
        try {
            const albumData = trackService.getAlbumInfo();
            const tracks = await trackRepository.findAll();
            
            return sendSuccess(res, {
                album: albumData,
                tracks: tracks
            });
            
        } catch (error) {
            console.error(error);
            return sendError(res, 500, "Erro na leitura do Voo.");
        }
    }
    
    return sendMethodNotAllowed(res);
};
