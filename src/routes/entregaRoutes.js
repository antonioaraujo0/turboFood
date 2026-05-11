const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/entregaController");

/**
 * @swagger
 * tags:
 *   name: Entrega
 *   description: "Caso de uso: Finalizar Entrega/Avaliação/Cancelamento [RF41] — RN01: Entregador disponível (status=ativo) | RN02: Uma avaliação por pedido (somente após entregue)"
 */

/**
 * @swagger
 * /entrega:
 *   get:
 *     summary: "[RF44] Lista pedidos em fase de entrega (pronto, saiu_para_entrega, entregue)"
 *     tags: [Entrega]
 *     responses:
 *       200:
 *         description: Lista de pedidos em entrega
 */
router.get("/", ctrl.listar);

/**
 * @swagger
 * /entrega/{id}:
 *   get:
 *     summary: "[RF44] Busca pedido de entrega pelo ID"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado com entregador e avaliação
 *       404:
 *         description: Pedido não encontrado
 */
router.get("/:id", ctrl.buscarPorId);

/**
 * @swagger
 * /entrega/{id}/atribuir:
 *   post:
 *     summary: "[RF41] Atribuir entregador ao pedido — RN01: entregador deve estar 'ativo' (transação atômica)"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido (deve estar com status = pronto)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entregadorId]
 *             properties:
 *               entregadorId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Entregador atribuído; pedido → saiu_para_entrega; entregador → em_entrega
 *       400:
 *         description: "RN01: Entregador não está ativo ou pedido no status incorreto"
 *       404:
 *         description: Pedido ou entregador não encontrado
 */
router.post("/:id/atribuir", ctrl.atribuirEntregador);

/**
 * @swagger
 * /entrega/{id}/confirmar:
 *   post:
 *     summary: "[RF41] Confirmar entrega — status → entregue; entregador → ativo (transação atômica)"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrega confirmada com sucesso
 *       400:
 *         description: Pedido não está em rota de entrega
 *       404:
 *         description: Pedido não encontrado
 */
router.post("/:id/confirmar", ctrl.confirmarEntrega);

/**
 * @swagger
 * /entrega/{id}/cancelar:
 *   delete:
 *     summary: "[RF43] Cancelar entrega em curso — pedido volta a 'pronto'; entregador → ativo"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrega cancelada
 *       400:
 *         description: Pedido não está em rota de entrega
 *       404:
 *         description: Pedido não encontrado
 */
router.delete("/:id/cancelar", ctrl.cancelarEntrega);

/**
 * @swagger
 * /entrega/avaliar:
 *   post:
 *     summary: "[RF41] Avaliar pedido — RN02: 1 avaliação por pedido, somente após 'entregue' (transação atômica)"
 *     tags: [Entrega]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pedidoId, clienteId, notaComida, notaEntrega]
 *             properties:
 *               pedidoId:
 *                 type: integer
 *                 example: 1
 *               clienteId:
 *                 type: integer
 *                 example: 1
 *               notaComida:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               notaEntrega:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comentario:
 *                 type: string
 *                 example: Excelente! Pizza chegou quentinha.
 *     responses:
 *       201:
 *         description: Avaliação registrada com sucesso
 *       400:
 *         description: "RN02: Pedido já avaliado ou não entregue ainda"
 *       404:
 *         description: Pedido não encontrado
 */
router.post("/avaliar", ctrl.avaliar);

module.exports = router;
