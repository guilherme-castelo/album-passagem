const authService = require('./authService');
const { sendSuccess, sendError } = require('../../lib/response');

const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      return sendSuccess(res, result, 200);
    } catch (err) {
      return sendError(res, 401, err.message);
    }
  }
};

module.exports = authController;
