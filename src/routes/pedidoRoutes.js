const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pedidoController');

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: "Caso de uso: Finalizar Pedido [RF29] — RN01: Endereço pertence ao cliente | RN02: Estoque suficiente (decrementado atomicamente)"
 */

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: "[RF32] Lista todos os pedidos (ordem decrescente por data)"
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos com itens, cliente e endereço
 */
router.get('/', ctrl.listar);

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     summary: "[RF32] Busca um pedido pelo ID"
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/:id', ctrl.buscarPorId);

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: "[RF29] Finalizar Pedido — verifica RN01 (endereço) e RN02 (estoque) em transação"
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clienteId, enderecoEntregaId, formaPagamento, itens]
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 example: 1
 *               enderecoEntregaId:
 *                 type: integer
 *                 example: 1
 *               formaPagamento:
 *                 type: string
 *                 enum: [credito, debito, pix]
 *                 example: pix
 *               observacao:
 *                 type: string
 *                 example: Sem cebola
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produtoId:
 *                       type: integer
 *                       example: 1
 *                     quantidade:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: "RN01: Endereço inválido | RN02: Estoque insuficiente"
 *       404:
 *         description: Cliente, endereço ou produto não encontrado
 */
router.post('/', ctrl.criar);

/**
 * @swagger
 * /pedidos/{id}:
 *   put:
 *     summary: "[RF30] Alterar pedido (somente quando status = aguardando)"
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observacao:
 *                 type: string
 *               enderecoEntregaId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pedido atualizado
 *       400:
 *         description: Pedido não pode ser alterado neste status
 *       404:
 *         description: Pedido não encontrado
 */
router.put('/:id', ctrl.atualizar);

/**
 * @swagger
 * /pedidos/{id}:
 *   delete:
 *     summary: "[RF31] Cancelar pedido — devolve estoque atomicamente (somente até status = confirmado)"
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
 *       400:
 *         description: Pedido não pode ser cancelado neste status
 *       404:
 *         description: Pedido não encontrado
 */
router.delete('/:id', ctrl.remover);

/**
 * @swagger
 * /pedidos/{id}/avancar-status:
 *   patch:
 *     summary: "[RF37] Avançar status da cozinha integrado ao pedido"
 *     tags: [Pedidos]
 */
router.patch('/:id/avancar-status', ctrl.avancarStatus);

module.exports = router;
