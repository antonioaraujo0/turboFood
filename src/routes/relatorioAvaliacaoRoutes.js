/**
 * relatorioAvaliacaoRoute.js
 *
 * GET /relatorios/avaliacoes/bairro/:inicio/:termino
 * GET /relatorios/avaliacoes/entregadores/:inicio/:termino
 */

const express = require('express');
const router = express.Router();
const RelatorioAvaliacaoController = require('../controllers/relatorioAvaliacaoController');

router.get('/bairro/:inicio/:termino',       RelatorioAvaliacaoController.avaliacoesByBairroAndPeriodo);
router.get('/entregadores/:inicio/:termino', RelatorioAvaliacaoController.desempenhoEntregadoresByPeriodo);

module.exports = router;
