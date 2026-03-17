const jwt = require('jsonwebtoken');
const { sendError } = require('./response');

/**
 * Middleware que valida o JWT no header Authorization: Bearer <token>
 * Injeta `req.admin` com o payload decodificado.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 401, 'Token de autenticação não fornecido.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    if (next) return next();
    return null;
  } catch (err) {
    return sendError(res, 401, 'Token inválido ou expirado.');
  }
}

/**
 * Para uso em handlers serverless (Vercel/Express adapter):
 * verifica e retorna true se rejeitado.
 */
function verifyTokenHandler(req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    sendError(res, 401, 'Token de autenticação não fornecido.');
    return false;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    return true;
  } catch (err) {
    sendError(res, 401, 'Token inválido ou expirado.');
    return false;
  }
}

module.exports = { verifyToken, verifyTokenHandler };
