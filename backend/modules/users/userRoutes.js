const express = require('express');
const userController = require('./userController');
const { verifyToken } = require('../../lib/auth');

const router = express.Router();

// Todas as rotas de usuários exigem JWT
router.use(verifyToken);

router.get('/', (req, res) => userController.list(req, res));
router.post('/', (req, res) => userController.create(req, res));
router.put('/:id', (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));

module.exports = router;
