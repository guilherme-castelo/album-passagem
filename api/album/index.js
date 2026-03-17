const albumController = require('../../backend/modules/album/albumController');
const trackController = require('../../backend/modules/tracks/trackController');
const applyCors = require('../../backend/lib/cors');
const { verifyTokenHandler } = require('../../backend/lib/auth');

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
      if (!id) return await albumController.list(req, res);
      if (action === 'tracks') {
        return await trackController.listByAlbum(req, res);
      }
      return await albumController.getById(req, res);
    }

    if (req.method === 'POST') {
      if (!verifyTokenHandler(req, res)) return;
      if (id && action === 'reorder') {
        return await trackController.reorder(req, res);
      }
      if (id && action === 'tracks') {
        return await trackController.create(req, res);
      }
      return await albumController.create(req, res);
    }

    if (req.method === 'PUT' && id) {
      if (!verifyTokenHandler(req, res)) return;
      return await albumController.update(req, res);
    }

    if (req.method === 'DELETE' && id) {
      if (!verifyTokenHandler(req, res)) return;
      return await albumController.delete(req, res);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Error [Album]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
