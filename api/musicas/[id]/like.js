const applyCors = require("../../lib/cors");
const {
  sendError,
  sendMethodNotAllowed,
  sendNotFound,
  sendSuccess,
} = require("../../lib/response");
const trackRepository = require("../../repositories/trackRepository");
const trackService = require("../../services/trackService");

module.exports = async (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method === "POST") {
    const rawId = req.query.id || req.vercelParams?.id;
    const trackId = parseInt(rawId, 10);
    if (isNaN(trackId)) return sendError(res, 400, "ID inválido.");
    const { action } = req.body;

    try {
      const track = await trackRepository.findById(trackId);
      if (!track) return sendNotFound(res, "Voo não encontrado");

      const currentLikes = trackService.toggleLike(track, action);
      await trackRepository.updateLikes(trackId, currentLikes);

      return sendSuccess(res, { success: true, likes: currentLikes });
    } catch (err) {
      console.error(err);
      return sendError(res, 500, "Falha na comunicação.");
    }
  }

  return sendMethodNotAllowed(res);
};
