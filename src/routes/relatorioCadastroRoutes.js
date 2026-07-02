/**
 * relatorioCadastroRoutes.js
 *
 * Rotas dos Relatórios de Listagens — RF45 a RF52
 *
 * RF45 – GET /relatorios/categorias
 * RF46 – GET /relatorios/produtos
 * RF47 – GET /relatorios/clientes
 * RF48 – GET /relatorios/entregadores
 * RF49 – GET /relatorios/veiculos
 * RF50 – GET /relatorios/pedidos
 * RF51 – GET /relatorios/avaliacoes-cadastro
 * RF52 – GET /relatorios/pagamentos
 *
 * Nota: RF51 usa /avaliacoes-cadastro para não colidir com as rotas já
 * existentes em relatorioAvaliacaoRoutes (/relatorios/avaliacoes/bairro/...
 * e /relatorios/avaliacoes/entregadores/...).
 *
 * Autenticação: todas as rotas exigem token JWT válido (autenticar)
 * e perfil admin (autorizarPerfil), seguindo o padrão do Código B.
 */

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/relatorioCadastroController');

// Relatórios de listagem são somente leitura e ficam públicos (mesmo padrão dos
// relatórios de entrega e de avaliação), para permitir a consulta pelo frontend
// sem exigir login. Para reativar a proteção:
//   const { autenticar, autorizarPerfil } = require('../middleware/authMiddleware');
//   router.use(autenticar, autorizarPerfil('admin'));

// ─── RF45 ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /relatorios/categorias:
 *   get:
 *     summary: "[RF45] Listar Categorias"
 *     description: >
 *       Lista todas as categorias com nome, descrição, ícone e total de produtos
 *       vinculados. Ordenadas por ordem personalizada e depois alfabeticamente.
 *     tags: [Relatórios de Cadastro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra por categorias ativas ou inativas. Sem filtro retorna todas.
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
 *                 total:
 *                   type: integer
 *                 categorias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *                       descricao:
 *                         type: string
 *                       icone:
 *                         type: string
 *                       ativo:
 *                         type: boolean
 *                       ordem:
 *                         type: integer
 *                         nullable: true
 *                       totalProdutos:
 *                         type: integer
 *                       produtosDisponiveis:
 *                         type: integer
 *                       criadoEm:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Perfil sem permissão
 *       500:
 *         description: Erro interno
 */
router.get('/categorias', ctrl.listarCategorias);

// ─── RF46 ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /relatorios/produtos:
 *   get:
 *     summary: "[RF46] Listar Produtos"
 *     description: >
 *       Lista todos os produtos por categoria com nome, preço, estoque e
 *       disponibilidade. Inclui total de vendas realizadas por produto.
 *     tags: [Relatórios de Cadastro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filtra por categoria específica
 *       - in: query
 *         name: disponivel
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra por disponibilidade
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
 *                 total:
 *                   type: integer
 *                 resumoPorCategoria:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoria:
 *                         type: string
 *                       totalProdutos:
 *                         type: integer
 *                       estoqueTotal:
 *                         type: integer
 *                 produtos:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Perfil sem permissão
 *       500:
 *         description: Erro interno
 */
router.get('/produtos', ctrl.listarProdutos);

// ─── RF47 ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /relatorios/clientes:
 *   get:
 *     summary: "[RF47] Listar Clientes"
 *     description: >
 *       Lista todos os clientes com nome completo, e-mail, telefone e CPF.
 *       Inclui total de pedidos e valor total gasto. Ordenado alfabeticamente.
 *     tags: [Relatórios de Cadastro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra por clientes ativos ou inativos
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *           example: João
 *         description: Busca por nome ou e-mail
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
 *                 totalClientes:
 *                   type: integer
 *                 totalAtivos:
 *                   type: integer
 *                 totalInativos:
 *                   type: integer
 *                 receitaTotal:
 *                   type: string
 *                 clientes:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Perfil sem permissão
 *       500:
 *         description: Erro interno
 */
router.get('/clientes', ctrl.listarClientes);

// ─── RF48 ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /relatorios/entregadores:
 *   get:
 *     summary: "[RF48] Listar Entregadores"
 *     description: >
 *       Lista todos os entregadores com nome, status e tipo de veículo.
 *       Inclui total de entregas, médias de avaliação e avaliações negativas
 *       (monitoramento da RN01 — corte por < 2★ após 50 entregas).
 *     tags: [Relatórios de Cadastro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, inativo, em_entrega]
 *           example: ativo
 *         description: Filtra por status do entregador
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *           example: Carlos
 *         description: Busca por nome
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
 *                 totalEntregadores:
 *                   type: integer
 *                 totalDisponiveis:
 *                   type: integer
 *                 totalEmEntrega:
 *                   type: integer
 *                 totalInativos:
 *                   type: integer
 *                 totalEntregasGeral:
 *                   type: integer
 *                 entregadores:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Perfil sem permissão
 *       500:
 *         description: Erro interno
 */
router.get('/entregadores', ctrl.listarEntregadores);

// ─── RF49 ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /relatorios/veiculos:
 *   get:
 *     summary: "[RF49] Listar Veículos"
 *     description: >
 *       Lista todos os veículos com modelo, placa, cor e status.
 *       Inclui entregador atribuído. Ordenado alfabeticamente por modelo.
 *     tags: [Relatórios de Cadastro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [disponivel, em_uso, manutencao, indisponivel]
 *           example: disponivel
 *         description: Filtra por status do veículo
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [moto, bicicleta, carro]
 *           example: moto
 *         description: Filtra por tipo
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
 *                 totalVeiculos:
 *                   type: integer
 *                 totalDisponiveis:
 *                   type: integer
 *                 totalEmUso:
 *                   type: integer
 *                 totalManutencao:
 *                   type: integer
 *                 totalIndisponiveis:
 *                   type: integer
 *                 veiculos:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Perfil sem permissão
 *       500:
 *         description: Erro interno
 */
router.get('/veiculos', ctrl.listarVeiculos);

// ─── RF50 ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /relatorios/pedidos:
 *   get:
 *     summary: "[RF50] Listar Pedidos"
 *     description: >
 *       Lista todos os pedidos filtráveis por cliente, status e período.
 *       Inclui dados do cliente, endereço de entrega, total de itens e
 *       status de pagamento. Ordenado por data decrescente.
 *     tags: [Relatórios de Cadastro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filtra por cliente específico
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aguardando, confirmado, em_preparo, pronto, saiu_para_entrega, entregue, cancelado]
 *           example: entregue
 *         description: Filtra por status do pedido
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
 *         name: busca
 *         schema:
 *           type: string
 *           example: João
 *         description: Busca por ID do pedido ou nome do cliente
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
 *                 totalPedidos:
 *                   type: integer
 *                 emAndamento:
 *                   type: integer
 *                 entregues:
 *                   type: integer
 *                 cancelados:
 *                   type: integer
 *                 receitaTotal:
 *                   type: string
 *                 pedidos:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Perfil sem permissão
 *       500:
 *         description: Erro interno
 */
router.get('/pedidos', ctrl.listarPedidos);

// ─── RF51 ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /relatorios/avaliacoes-cadastro:
 *   get:
 *     summary: "[RF51] Listar Avaliações (listagem completa)"
 *     description: >
 *       Lista todas as avaliações com nota da comida, nota da entrega,
 *       comentário e dados do cliente. Inclui média geral e resumo por
 *       faixa de nota. Filtráveis por período e faixa de nota.
 *       Nota: rota nomeada /avaliacoes-cadastro para não colidir com os
 *       relatórios analíticos já existentes em /relatorios/avaliacoes/...
 *     tags: [Relatórios de Cadastro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-01"
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-31"
 *         description: Data final (YYYY-MM-DD)
 *       - in: query
 *         name: notaMin
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 3
 *         description: Nota mínima (média entre comida e entrega)
 *       - in: query
 *         name: notaMax
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         description: Nota máxima
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *           example: João
 *         description: Busca por nome do cliente, ID do pedido ou comentário
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
 *                 totalAvaliacoes:
 *                   type: integer
 *                 mediaGeral:
 *                   type: string
 *                   nullable: true
 *                 total5estrelas:
 *                   type: integer
 *                 total4estrelas:
 *                   type: integer
 *                 abaixo3estrelas:
 *                   type: integer
 *                 avaliacoes:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Perfil sem permissão
 *       500:
 *         description: Erro interno
 */
router.get('/avaliacoes-cadastro', ctrl.listarAvaliacoes);

// ─── RF52 ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /relatorios/pagamentos:
 *   get:
 *     summary: "[RF52] Listar Pagamentos"
 *     description: >
 *       Lista todos os pagamentos com valor, forma, status, pedido e cliente.
 *       Inclui receita total dos aprovados e totais por forma de pagamento.
 *       Ordenado por data decrescente.
 *     tags: [Relatórios de Cadastro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, aprovado, recusado]
 *           example: aprovado
 *         description: Filtra por status do pagamento
 *       - in: query
 *         name: forma
 *         schema:
 *           type: string
 *           enum: [credito, debito, pix]
 *           example: pix
 *         description: Filtra por forma de pagamento
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-01"
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-31"
 *         description: Data final (YYYY-MM-DD)
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filtra por cliente específico
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
 *                 totalPagamentos:
 *                   type: integer
 *                 totalAprovados:
 *                   type: integer
 *                 totalPendentes:
 *                   type: integer
 *                 totalRecusados:
 *                   type: integer
 *                 receitaTotal:
 *                   type: string
 *                 totalPorForma:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       forma:
 *                         type: string
 *                       quantidade:
 *                         type: integer
 *                       total:
 *                         type: string
 *                 pagamentos:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Perfil sem permissão
 *       500:
 *         description: Erro interno
 */
router.get('/pagamentos', ctrl.listarPagamentos);

module.exports = router;
