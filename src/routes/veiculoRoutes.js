const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/veiculoController');

/**
 * @swagger
 * tags:
 *   name: Veículos
 *   description: Gerenciamento da frota de veículos de entrega
 */

/**
 * @swagger
 * /veiculos:
 *   get:
 *     summary: Lista todos os veículos em ordem alfabética por modelo
 *     tags: [Veículos]
 *     responses:
 *       200:
 *         description: Lista de veículos com entregador vinculado
 */
router.get('/', ctrl.listar);

/**
 * @swagger
 * /veiculos/{id}:
 *   get:
 *     summary: Busca um veículo pelo ID
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Veículo encontrado
 *       404:
 *         description: Veículo não encontrado
 */
router.get('/:id', ctrl.buscarPorId);

/**
 * @swagger
 * /veiculos:
 *   post:
 *     summary: Cadastra um novo veículo
 *     tags: [Veículos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo, modelo, cor, ano]
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [moto, bicicleta, carro]
 *                 example: moto
 *               modelo:
 *                 type: string
 *                 example: Honda CG 160
 *               placa:
 *                 type: string
 *                 example: ABC-1234
 *               cor:
 *                 type: string
 *                 example: Vermelho
 *               ano:
 *                 type: integer
 *                 example: 2023
 *               renavan:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [disponivel, em_uso, manutencao, indisponivel]
 *               entregadorId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Veículo cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Placa ou RENAVAN já cadastrado
 */
router.post('/', ctrl.criar);

/**
 * @swagger
 * /veiculos/{id}:
 *   put:
 *     summary: Atualiza um veículo
 *     tags: [Veículos]
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
 *               tipo:
 *                 type: string
 *               modelo:
 *                 type: string
 *               placa:
 *                 type: string
 *               cor:
 *                 type: string
 *               ano:
 *                 type: integer
 *               status:
 *                 type: string
 *               entregadorId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Veículo atualizado
 *       404:
 *         description: Veículo não encontrado
 *       409:
 *         description: Placa ou RENAVAN já em uso
 */
router.put('/:id', ctrl.atualizar);

/**
 * @swagger
 * /veiculos/{id}:
 *   delete:
 *     summary: Remove um veículo
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Veículo removido com sucesso
 *       404:
 *         description: Veículo não encontrado
 *       409:
 *         description: Veículo possui entregador vinculado e não pode ser removido
 */
router.delete('/:id', ctrl.remover);

module.exports = router;
