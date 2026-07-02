const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/entregaController");

/**
 * @swagger
 * tags:
 *   name: Entrega
 *   description: "Caso de uso: Entrega [RF41] — RN01: até 5 pedidos por entrega | RN02: jornada máx. 8h em 24h | Entregador deve estar 'ativo'"
 */

/**
 * @swagger
 * /entrega:
 *   get:
 *     summary: "Lista entregas (filtros opcionais ?status= e ?entregadorId=)"
 *     tags: [Entrega]
 *     responses:
 *       200:
 *         description: Lista de entregas com entregador e pedidos
 */
router.get("/", ctrl.listar);

/**
 * @swagger
 * /entrega:
 *   post:
 *     summary: "[RF41] Criar entrega — RN01 (máx 5 pedidos) + RN02 (jornada 8h/24h), em transação"
 *     tags: [Entrega]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entregadorId, pedidosIds]
 *             properties:
 *               entregadorId:
 *                 type: integer
 *                 example: 1
 *               pedidosIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Entrega criada
 *       400:
 *         description: "Violação de RN01/RN02 ou entregador indisponível"
 *       404:
 *         description: Entregador não encontrado
 */
router.post("/", ctrl.criar);

/**
 * @swagger
 * /entrega/entregador/{entregadorId}/jornada:
 *   get:
 *     summary: "[RN02] Estatísticas de jornada do entregador nas últimas 24h"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: entregadorId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Horas trabalhadas/disponíveis e se o limite foi atingido
 */
router.get("/entregador/:entregadorId/jornada", ctrl.jornada);

/**
 * @swagger
 * /entrega/{id}:
 *   get:
 *     summary: "Busca entrega pelo ID (com entregador e pedidos)"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Entrega encontrada }
 *       404: { description: Entrega não encontrada }
 */
router.get("/:id", ctrl.buscarPorId);

/**
 * @swagger
 * /entrega/{id}/pedidos:
 *   post:
 *     summary: "[RN01] Adiciona um pedido à entrega (respeita limite de 5)"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pedidoId]
 *             properties:
 *               pedidoId: { type: integer, example: 4 }
 *     responses:
 *       200: { description: Pedido adicionado }
 *       400: { description: "RN01: limite de 5 pedidos atingido" }
 */
router.post("/:id/pedidos", ctrl.adicionarPedido);

/**
 * @swagger
 * /entrega/{id}/iniciar:
 *   post:
 *     summary: "Inicia a entrega (status → EM_ROTA)"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Entrega em rota }
 *       400: { description: Status inválido para iniciar }
 */
router.post("/:id/iniciar", ctrl.iniciar);

/**
 * @swagger
 * /entrega/{id}/finalizar:
 *   post:
 *     summary: "Finaliza a entrega (status → ENTREGUE; libera entregador)"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Entrega concluída }
 *       400: { description: Status inválido para finalizar }
 */
router.post("/:id/finalizar", ctrl.finalizar);

/**
 * @swagger
 * /entrega/{id}/falhar:
 *   post:
 *     summary: "Marca a entrega como FALHOU (libera entregador)"
 *     tags: [Entrega]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivoFalha: { type: string, example: "Cliente ausente" }
 *     responses:
 *       200: { description: Entrega marcada como falha }
 *       400: { description: Não é possível falhar uma entrega concluída }
 */
router.post("/:id/falhar", ctrl.falhar);

module.exports = router;
