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
    const { rating, oldRating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 400, "Forneça uma avaliação válida de 1 a 5.");
    }

    try {
      const track = await trackRepository.findById(trackId);
      if (!track) return sendNotFound(res, "Voo não encontrado");

      const newRatings = trackService.submitRating(track, rating, oldRating);
      await trackRepository.updateRatings(trackId, newRatings);

      return sendSuccess(res, { success: true, ratings: newRatings });
    } catch (err) {
      console.error(err);
      return sendError(res, 500, "Falha na comunicação.");
    }
  }

  return sendMethodNotAllowed(res);
};
