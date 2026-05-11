const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pagamentoController');

/**
 * @swagger
 * tags:
 *   name: Pagamentos
 *   description: "Caso de uso: Finalizar Pagamento [RF33] — RN01: Máximo 1 pagamento aprovado por pedido | RN02: Aprovação confirma o pedido automaticamente"
 */

/**
 * @swagger
 * /pagamentos:
 *   get:
 *     summary: "[RF36] Lista todos os pagamentos (ordem decrescente)"
 *     tags: [Pagamentos]
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 */
router.get('/', ctrl.listar);

/**
 * @swagger
 * /pagamentos/{id}:
 *   get:
 *     summary: "[RF36] Busca pagamento pelo ID"
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pagamento encontrado
 *       404:
 *         description: Pagamento não encontrado
 */
router.get('/:id', ctrl.buscarPorId);

/**
 * @swagger
 * /pagamentos:
 *   post:
 *     summary: "[RF33] Finalizar Pagamento — RN01 (1 aprovado) + RN02 (confirma pedido) em transação"
 *     tags: [Pagamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pedidoId, forma]
 *             properties:
 *               pedidoId:
 *                 type: integer
 *                 example: 1
 *               forma:
 *                 type: string
 *                 enum: [credito, debito, pix]
 *                 example: pix
 *               status:
 *                 type: string
 *                 enum: [pendente, aprovado, recusado]
 *                 example: aprovado
 *     responses:
 *       201:
 *         description: Pagamento registrado. Se aprovado, pedido vai para "confirmado".
 *       400:
 *         description: "RN01: Já existe pagamento aprovado para este pedido"
 *       404:
 *         description: Pedido não encontrado
 */
router.post('/', ctrl.criar);

/**
 * @swagger
 * /pagamentos/{id}:
 *   put:
 *     summary: "[RF34] Alterar status do pagamento (ex: pendente → aprovado)"
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, aprovado, recusado]
 *     responses:
 *       200:
 *         description: Pagamento atualizado
 *       400:
 *         description: Regra de negócio violada
 *       404:
 *         description: Pagamento não encontrado
 */
router.put('/:id', ctrl.atualizar);

/**
 * @swagger
 * /pagamentos/{id}:
 *   delete:
 *     summary: "[RF35] Remove pagamento (somente se não estiver aprovado)"
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pagamento removido
 *       400:
 *         description: Pagamento aprovado não pode ser removido
 *       404:
 *         description: Pagamento não encontrado
 */
router.delete('/:id', ctrl.remover);

module.exports = router;
