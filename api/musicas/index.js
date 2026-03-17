const albumService = require('../../backend/modules/album/albumService');
const trackService = require('../../backend/modules/tracks/trackService');
const trackController = require('../../backend/modules/tracks/trackController');
const applyCors = require('../../backend/lib/cors');
const { sendError, sendMethodNotAllowed, sendSuccess } = require('../../backend/lib/response');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;

  let path = req.query.path || req.vercelPath || [];
  if (typeof path === 'string') path = path.split('/').filter(Boolean);

  const id = path[0];
  const action = path[1];

  req.params = req.params || {};
  if (id) req.params.id = id;

  try {
    if (req.method === 'GET') {
      // Para o site público, pegamos o primeiro álbum como padrão
      const albums = await albumService.listAlbums();
      const album = albums[0] || (await albumService.getAlbum()); // Fallback pro DEFAULT_ALBUM se vazio

      const tracks = await trackService.list(album.id ? { albumId: album.id } : {});

      return sendSuccess(res, {
        album: album,
        tracks: tracks
      });
    }

    if (req.method === 'POST') {
      if (id && action === 'like') return await trackController.like(req, res);
      if (id && action === 'rate') return await trackController.rate(req, res);
    }

    return sendMethodNotAllowed(res);
  } catch (error) {
    console.error('API Error [Musicas Legacy]:', error);
    return sendError(res, 500, 'Erro interno do servidor.');
  }
};
