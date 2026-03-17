const userService = require('./userService');
const { sendSuccess, sendError, sendNotFound } = require('../../lib/response');

const userController = {
  async list(req, res) {
    try {
      const users = await userService.list();
      return sendSuccess(res, users);
    } catch (err) {
      return sendError(res, 500, 'Erro ao listar usuários.');
    }
  },

  async create(req, res) {
    try {
      const { username, password } = req.body;
      const user = await userService.create(username, password);
      return sendSuccess(res, user, 201);
    } catch (err) {
      return sendError(res, 400, err.message);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { username, password } = req.body;
      const user = await userService.update(id, username, password);
      return sendSuccess(res, user);
    } catch (err) {
      return sendError(res, 400, err.message);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.delete(id);
      return sendSuccess(res, result);
    } catch (err) {
      return sendNotFound(res, err.message);
    }
  }
};

module.exports = userController;
