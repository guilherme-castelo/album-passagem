const authController = require('../../backend/modules/auth/authController');
const applyCors = require('../../backend/lib/cors');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;

  let path = req.query.path || req.vercelPath || []; // /api/auth/[login, register, etc.]
  if (typeof path === 'string') path = path.split('/').filter(Boolean);

  const action = path[0];

  try {
    if (req.method === 'POST' && action === 'login') {
      return await authController.login(req, res);
    }

    return res.status(405).json({ error: 'Method Not Allowed or Endpoint Not Found' });
  } catch (err) {
    console.error('API Error [Auth]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
