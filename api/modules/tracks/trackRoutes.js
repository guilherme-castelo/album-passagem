const express = require('express');
const trackController = require('./trackController');
const { verifyToken } = require('../../lib/auth');

const router = express.Router();

// ─── Rotas Públicas ─────────────────────────────────────────────────────────
// Interações do site público (like e rate)
router.post('/:id/like', (req, res) => trackController.like(req, res));
router.post('/:id/rate', (req, res) => trackController.rate(req, res));

// ─── Rotas Administrativas (Requerem JWT) ────────────────────────────────────
router.get('/', verifyToken, (req, res) => trackController.list(req, res));
router.post('/', verifyToken, (req, res) => trackController.create(req, res));
router.get('/:id', verifyToken, (req, res) => trackController.getById(req, res));
router.put('/:id', verifyToken, (req, res) => trackController.update(req, res));
router.delete('/:id', verifyToken, (req, res) => trackController.delete(req, res));

module.exports = router;
