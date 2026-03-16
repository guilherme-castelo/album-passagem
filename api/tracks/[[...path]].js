const trackController = require('../../backend/modules/tracks/trackController');
const applyCors = require('../../backend/lib/cors');
const { verifyTokenHandler } = require('../../backend/lib/auth');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;

    // req.query.path is an array /api/tracks/:id/:action -> ['id', 'action']
    const path = req.query.path || req.vercelPath || [];
    const id = path[0];
    const action = path[1];

    req.params = req.params || {};
    if (id) req.params.id = id;

    const isPublicRoute = (id && (action === 'like' || action === 'rate'));
    if (!isPublicRoute) {
        if (!verifyTokenHandler(req, res)) return;
    }

    try {
        if (req.method === 'GET') {
            if (id) return await trackController.getById(req, res);
            return await trackController.list(req, res);
        }

        if (req.method === 'POST') {
            if (id && action === 'like') return await trackController.like(req, res);
            if (id && action === 'rate') return await trackController.rate(req, res);
            return await trackController.create(req, res);
        }

        if (req.method === 'PUT' && id) {
            return await trackController.update(req, res);
        }

        if (req.method === 'DELETE' && id) {
            return await trackController.delete(req, res);
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
        console.error('API Error [Tracks]:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
