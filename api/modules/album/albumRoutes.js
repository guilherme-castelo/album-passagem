const express = require('express');
const albumController = require('./albumController');
const { verifyToken } = require('../../lib/auth');

const router = express.Router();

// GET /api/album — protegido por JWT
router.get('/', verifyToken, (req, res) => albumController.get(req, res));

// PUT /api/album — protegido por JWT
router.put('/', verifyToken, (req, res) => albumController.update(req, res));

module.exports = router;
