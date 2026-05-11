/**
 * authRoutes.js
 * RF25 – Inserir Login  POST  /auth/login
 * RF28 – Visualizar     GET   /auth/me  (perfil do usuário logado)
 */

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { autenticar } = require('../middleware/authMiddleware');

// RF25 – Login
router.post('/login', login);

// RF28 – Visualizar usuário autenticado
router.get('/me', autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;
