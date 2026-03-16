const userController = require('../../backend/modules/users/userController');
const applyCors = require('../../backend/lib/cors');
const { verifyTokenHandler } = require('../../backend/lib/auth');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (!verifyTokenHandler(req, res)) return;

    const path = req.query.path || [];
    const id = path[0];

    req.params = req.params || {};
    if (id) req.params.id = id;

    try {
        if (req.method === 'GET') {
            return await userController.list(req, res);
        }
        
        if (req.method === 'POST') {
            return await userController.create(req, res);
        }
        
        if (req.method === 'PUT' && id) {
            return await userController.update(req, res);
        }
        
        if (req.method === 'DELETE' && id) {
            return await userController.delete(req, res);
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (err) {
        console.error('API Error [Users]:', err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
