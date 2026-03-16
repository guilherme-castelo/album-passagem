const express = require('express');
const authController = require('./authController');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => authController.login(req, res));

module.exports = router;
