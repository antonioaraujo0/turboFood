const { Cliente } = require('../models');

// GET /clientes
const listar = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      order: [['nomeCompleto', 'ASC']],
      attributes: { exclude: ['senha'] },
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar clientes', detalhe: error.message });
  }
};

// GET /clientes/:id
const buscarPorId = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] },
    });
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar cliente', detalhe: error.message });
  }
};

// POST /clientes
const criar = async (req, res) => {
  try {
    const { nomeCompleto, email, telefone, cpf, senha } = req.body;

    if (!nomeCompleto || !email || !telefone || !cpf || !senha) {
      return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Unicidade de CPF e e-mail (RN)
    const emailExistente = await Cliente.findOne({ where: { email } });
    if (emailExistente) {
      return res.status(409).json({ erro: 'Já existe um cliente com este e-mail' });
    }

    const cpfExistente = await Cliente.findOne({ where: { cpf } });
    if (cpfExistente) {
      return res.status(409).json({ erro: 'Já existe um cliente com este CPF' });
    }

    const cliente = await Cliente.create({ nomeCompleto, email, telefone, cpf, senha });

    const { senha: _, ...clienteSemSenha } = cliente.toJSON();
    res.status(201).json(clienteSemSenha);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao criar cliente', detalhe: error.message });
  }
};

// PUT /clientes/:id
const atualizar = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });

    const { nomeCompleto, email, telefone, cpf, senha, ativo } = req.body;

    // Unicidade de CPF e e-mail (RN) - exceto o próprio cliente
    if (email && email !== cliente.email) {
      const emailExistente = await Cliente.findOne({ where: { email } });
      if (emailExistente) return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }

    if (cpf && cpf !== cliente.cpf) {
      const cpfExistente = await Cliente.findOne({ where: { cpf } });
      if (cpfExistente) return res.status(409).json({ erro: 'CPF já cadastrado' });
    }

    await cliente.update({ nomeCompleto, email, telefone, cpf, senha, ativo });

    const { senha: _, ...clienteSemSenha } = cliente.toJSON();
    res.json(clienteSemSenha);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao atualizar cliente', detalhe: error.message });
  }
};

// DELETE /clientes/:id
const remover = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });

    // RF02 – Bloqueio de remoção com pedidos ativos
    const { Pedido } = require('../models');
    const statusAtivos = ['aguardando', 'confirmado', 'em_preparo', 'pronto', 'saiu_para_entrega'];
    const pedidoAtivo = await Pedido.findOne({ where: { clienteId: cliente.id, status: statusAtivos } });
    if (pedidoAtivo) {
      return res.status(409).json({
        erro: 'Não é possível remover um cliente que possui pedidos em andamento.',
      });
    }

    await cliente.destroy();
    res.json({ mensagem: 'Cliente removido com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover cliente', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
