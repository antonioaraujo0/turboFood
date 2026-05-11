const { Entregador, Veiculo } = require('../models');

// GET /entregadores
const listar = async (req, res) => {
  try {
    const entregadores = await Entregador.findAll({
      order: [['nomeCompleto', 'ASC']],
      attributes: { exclude: ['senha'] },
      include: [{ model: Veiculo, as: 'veiculo', attributes: ['id', 'modelo', 'placa', 'tipo'] }],
    });
    res.json(entregadores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar entregadores', detalhe: error.message });
  }
};

// GET /entregadores/:id
const buscarPorId = async (req, res) => {
  try {
    const entregador = await Entregador.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] },
      include: [{ model: Veiculo, as: 'veiculo' }],
    });
    if (!entregador) return res.status(404).json({ erro: 'Entregador não encontrado' });
    res.json(entregador);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar entregador', detalhe: error.message });
  }
};

// POST /entregadores
const criar = async (req, res) => {
  try {
    const { nomeCompleto, email, telefone, cpf, cnh, tipoVeiculo, senha } = req.body;

    if (!nomeCompleto || !email || !telefone || !cpf || !cnh || !tipoVeiculo || !senha) {
      return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Unicidade de CPF e CNH (RN)
    const cpfExistente = await Entregador.findOne({ where: { cpf } });
    if (cpfExistente) return res.status(409).json({ erro: 'CPF já cadastrado' });

    const cnhExistente = await Entregador.findOne({ where: { cnh } });
    if (cnhExistente) return res.status(409).json({ erro: 'CNH já cadastrada' });

    const emailExistente = await Entregador.findOne({ where: { email } });
    if (emailExistente) return res.status(409).json({ erro: 'E-mail já cadastrado' });

    const entregador = await Entregador.create({ nomeCompleto, email, telefone, cpf, cnh, tipoVeiculo, senha });

    const { senha: _, ...semSenha } = entregador.toJSON();
    res.status(201).json(semSenha);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao criar entregador', detalhe: error.message });
  }
};

// PUT /entregadores/:id
const atualizar = async (req, res) => {
  try {
    const entregador = await Entregador.findByPk(req.params.id);
    if (!entregador) return res.status(404).json({ erro: 'Entregador não encontrado' });

    const { nomeCompleto, email, telefone, cpf, cnh, tipoVeiculo, senha, status } = req.body;

    if (cpf && cpf !== entregador.cpf) {
      const existe = await Entregador.findOne({ where: { cpf } });
      if (existe) return res.status(409).json({ erro: 'CPF já cadastrado' });
    }

    if (cnh && cnh !== entregador.cnh) {
      const existe = await Entregador.findOne({ where: { cnh } });
      if (existe) return res.status(409).json({ erro: 'CNH já cadastrada' });
    }

    if (email && email !== entregador.email) {
      const existe = await Entregador.findOne({ where: { email } });
      if (existe) return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }

    await entregador.update({ nomeCompleto, email, telefone, cpf, cnh, tipoVeiculo, senha, status });

    const { senha: _, ...semSenha } = entregador.toJSON();
    res.json(semSenha);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao atualizar entregador', detalhe: error.message });
  }
};

// DELETE /entregadores/:id
const remover = async (req, res) => {
  try {
    const entregador = await Entregador.findByPk(req.params.id, {
      include: [{ model: Veiculo, as: 'veiculo' }],
    });
    if (!entregador) return res.status(404).json({ erro: 'Entregador não encontrado' });

    // Bloqueio de atribuição quando inativo (RN) - verificar se está em entrega
    if (entregador.status === 'em_entrega') {
      return res.status(409).json({ erro: 'Não é possível remover um entregador que está em entrega' });
    }

    await entregador.destroy();
    res.json({ mensagem: 'Entregador removido com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover entregador', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
