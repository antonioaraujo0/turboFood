/**
 * avaliacaoRoutes.js
 * RF41 – Finalizar Avaliação   POST   /avaliacoes
 * RF42 – Alterar Avaliação     PUT    /avaliacoes/:id
 * RF43 – Remover Avaliação     DELETE /avaliacoes/:id
 * RF44 – Visualizar Avaliação  GET    /avaliacoes/:id
 * RF51 – Listar Avaliações     GET    /avaliacoes
 */

const express = require('express');
const router = express.Router();
const {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
} = require('../controllers/avaliacaoController');

router.get('/', listar);
router.get('/:id', buscarPorId);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', remover);

module.exports = router;
