const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/relatorioEntregaController');

/**
 * @swagger
 * tags:
 *   name: Relatórios de Entrega
 *   description: "Relatórios analíticos do processo de entrega — REL01: Entregas Concluídas | REL02: Horas Trabalhadas por Entregador"
 */

/**
 * @swagger
 * /relatorios/entregas-concluidas:
 *   get:
 *     summary: "[REL01] Quantidade de entregas concluídas com filtro por período e entregador"
 *     description: >
 *       Totaliza as entregas com status ENTREGUE agrupadas por entregador.
 *       Todos os filtros são opcionais — sem filtros retorna o total geral.
 *     tags: [Relatórios de Entrega]
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-01"
 *         description: Data inicial do período (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-31"
 *         description: Data final do período (YYYY-MM-DD)
 *       - in: query
 *         name: entregadorId
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filtra um entregador específico
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filtros:
 *                   type: object
 *                   properties:
 *                     dataInicio:
 *                       type: string
 *                       nullable: true
 *                     dataFim:
 *                       type: string
 *                       nullable: true
 *                     entregadorId:
 *                       type: integer
 *                       nullable: true
 *                 totalGeral:
 *                   type: integer
 *                   description: Soma de todas as entregas concluídas no período
 *                 totalEntregadores:
 *                   type: integer
 *                 porEntregador:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       entregadorId:
 *                         type: integer
 *                       entregador:
 *                         type: string
 *                       statusEntregador:
 *                         type: string
 *                       totalEntregas:
 *                         type: integer
 *                       primeiraEntrega:
 *                         type: string
 *                         format: date-time
 *                       ultimaEntrega:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Erro interno ao gerar o relatório
 */
router.get('/entregas-concluidas', ctrl.entregasConcluidas);

/**
 * @swagger
 * /relatorios/horas-trabalhadas:
 *   get:
 *     summary: "[REL02] Horas trabalhadas por entregador ativo em ciclo de 24h"
 *     description: >
 *       Para cada entregador ativo ou em_entrega, calcula o total de horas trabalhadas
 *       em um ciclo de 24h (dia calendário). Indica quem atingiu o limite de 8h (RN02).
 *       Sem filtro de data, usa o dia atual.
 *     tags: [Relatórios de Entrega]
 *     parameters:
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-20"
 *         description: Dia do ciclo a ser analisado (YYYY-MM-DD). Padrão é hoje.
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filtros:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                     inicioCiclo:
 *                       type: string
 *                     fimCiclo:
 *                       type: string
 *                 limiteJornada:
 *                   type: object
 *                   properties:
 *                     minutos:
 *                       type: integer
 *                       example: 480
 *                     horas:
 *                       type: integer
 *                       example: 8
 *                     descricao:
 *                       type: string
 *                 totalEntregadores:
 *                   type: integer
 *                 entregadoresComLimiteAtingido:
 *                   type: integer
 *                 porEntregador:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       entregadorId:
 *                         type: integer
 *                       entregador:
 *                         type: string
 *                       statusAtual:
 *                         type: string
 *                       totalEntregas:
 *                         type: integer
 *                       minutosTrabalhados:
 *                         type: integer
 *                       horasTrabalhadas:
 *                         type: number
 *                       minutosDisponiveis:
 *                         type: integer
 *                       horasDisponiveis:
 *                         type: string
 *                       percentualJornada:
 *                         type: string
 *                       limiteJornadaAtingido:
 *                         type: boolean
 *       500:
 *         description: Erro interno ao gerar o relatório
 */
router.get('/horas-trabalhadas', ctrl.horasTrabalhadasPorEntregador);

module.exports = router;
