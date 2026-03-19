const analyticsController = require('../../backend/modules/analytics/analyticsController');
const applyCors = require('../../backend/lib/cors');
const { verifyTokenHandler } = require('../../backend/lib/auth');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;

    let path = req.query.path || req.vercelPath || [];
    if (typeof path === 'string') path = path.split('/').filter(Boolean);

    const action = path[0];

    try {
        if (req.method === 'POST') {
            if (action === 'session') {
                return await analyticsController.registerSession(req, res);
            }
            return res.status(404).json({ error: "Endpoint não encontrado" });
        }

        if (req.method === 'GET') {
            // Protected routes
            if (!verifyTokenHandler(req, res)) return;

            if (action === 'dashboard') {
                return await analyticsController.getDashboard(req, res);
            }
            if (action === 'tracks') {
                return await analyticsController.getTrackMetrics(req, res);
            }
            
            return res.status(404).json({ error: "Endpoint protegido não encontrado" });
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (err) {
        console.error('API Error [Analytics]:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
