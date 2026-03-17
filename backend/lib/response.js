function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function sendMethodNotAllowed(res) {
  return sendError(res, 405, 'Method Not Allowed');
}

function sendNotFound(res, message = 'Não encontrado') {
  return sendError(res, 404, message);
}

function sendSuccess(res, data) {
  return res.status(200).json(data);
}

module.exports = {
  sendError,
  sendMethodNotAllowed,
  sendNotFound,
  sendSuccess
};
