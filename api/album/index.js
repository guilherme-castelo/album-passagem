const albumController = require('../../backend/modules/album/albumController');
const applyCors = require('../../backend/lib/cors');
const { verifyTokenHandler } = require('../../backend/lib/auth');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;

    const path = req.query.path || req.vercelPath || [];

    try {
        if (req.method === 'GET') {
            return await albumController.get(req, res);
        }

        if (req.method === 'PUT') {
            if (!verifyTokenHandler(req, res)) return;
            return await albumController.update(req, res);
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (err) {
        console.error('API Error [Album]:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
