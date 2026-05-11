const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/entregadorController');

/**
 * @swagger
 * tags:
 *   name: Entregadores
 *   description: Gerenciamento de entregadores
 */

/**
 * @swagger
 * /entregadores:
 *   get:
 *     summary: Lista todos os entregadores em ordem alfabética
 *     tags: [Entregadores]
 *     responses:
 *       200:
 *         description: Lista de entregadores com veículo vinculado
 */
router.get('/', ctrl.listar);

/**
 * @swagger
 * /entregadores/{id}:
 *   get:
 *     summary: Busca um entregador pelo ID
 *     tags: [Entregadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entregador encontrado
 *       404:
 *         description: Entregador não encontrado
 */
router.get('/:id', ctrl.buscarPorId);

/**
 * @swagger
 * /entregadores:
 *   post:
 *     summary: Cria um novo entregador
 *     tags: [Entregadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nomeCompleto, email, telefone, cpf, cnh, tipoVeiculo, senha]
 *             properties:
 *               nomeCompleto:
 *                 type: string
 *                 example: Carlos Oliveira
 *               email:
 *                 type: string
 *                 example: carlos@email.com
 *               telefone:
 *                 type: string
 *                 example: "(11) 99999-5555"
 *               cpf:
 *                 type: string
 *                 example: 111.111.111-11
 *               cnh:
 *                 type: string
 *                 example: "00000000000"
 *               tipoVeiculo:
 *                 type: string
 *                 enum: [moto, bicicleta, carro]
 *                 example: moto
 *               senha:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: Entregador criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: CPF, CNH ou e-mail já cadastrado
 */
router.post('/', ctrl.criar);

/**
 * @swagger
 * /entregadores/{id}:
 *   put:
 *     summary: Atualiza um entregador
 *     tags: [Entregadores]
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
 *               nomeCompleto:
 *                 type: string
 *               email:
 *                 type: string
 *               telefone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo, em_entrega]
 *     responses:
 *       200:
 *         description: Entregador atualizado
 *       404:
 *         description: Entregador não encontrado
 *       409:
 *         description: CPF ou CNH já em uso
 */
router.put('/:id', ctrl.atualizar);

/**
 * @swagger
 * /entregadores/{id}:
 *   delete:
 *     summary: Remove um entregador
 *     tags: [Entregadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entregador removido com sucesso
 *       404:
 *         description: Entregador não encontrado
 *       409:
 *         description: Entregador está em entrega e não pode ser removido
 */
router.delete('/:id', ctrl.remover);

module.exports = router;
