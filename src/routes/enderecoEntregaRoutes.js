const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enderecoEntregaController');

/**
 * @swagger
 * tags:
 *   name: Endereços
 *   description: Gerenciamento de endereços de entrega dos clientes
 */

/** @swagger
 * /enderecos:
 *   get:
 *     summary: Lista todos os endereços de entrega
 *     tags: [Endereços]
 *     responses:
 *       200:
 *         description: Lista de endereços
 */
router.get('/', ctrl.listar);

/** @swagger
 * /enderecos/{id}:
 *   get:
 *     summary: Busca endereço pelo ID
 *     tags: [Endereços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Endereço encontrado
 *       404:
 *         description: Endereço não encontrado
 */
router.get('/:id', ctrl.buscarPorId);

/** @swagger
 * /enderecos:
 *   post:
 *     summary: Cadastra endereço de entrega para um cliente
 *     tags: [Endereços]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clienteId, rua, numero, bairro, cidade]
 *             properties:
 *               clienteId:
 *                 type: integer
 *               rua:
 *                 type: string
 *               numero:
 *                 type: string
 *               complemento:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *     responses:
 *       201:
 *         description: Endereço criado
 */
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remover);

module.exports = router;
