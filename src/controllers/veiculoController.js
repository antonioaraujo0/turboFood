const { Veiculo, Entregador } = require('../models');

// GET /veiculos
const listar = async (req, res) => {
  try {
    const veiculos = await Veiculo.findAll({
      order: [['modelo', 'ASC']],
      include: [{ model: Entregador, as: 'entregador', attributes: ['id', 'nomeCompleto', 'status'] }],
    });
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar veículos', detalhe: error.message });
  }
};

// GET /veiculos/:id
const buscarPorId = async (req, res) => {
  try {
    const veiculo = await Veiculo.findByPk(req.params.id, {
      include: [{ model: Entregador, as: 'entregador', attributes: { exclude: ['senha'] } }],
    });
    if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar veículo', detalhe: error.message });
  }
};

// POST /veiculos
const criar = async (req, res) => {
  try {
    const { tipo, modelo, placa, cor, ano, renavan, status, entregadorId } = req.body;

    if (!tipo || !modelo || !cor || !ano) {
      return res.status(400).json({ erro: 'Tipo, modelo, cor e ano são obrigatórios' });
    }

    // Unicidade de placa e RENAVAN (RN)
    if (placa) {
      const placaExistente = await Veiculo.findOne({ where: { placa } });
      if (placaExistente) return res.status(409).json({ erro: 'Placa já cadastrada' });
    }

    if (renavan) {
      const renavamExistente = await Veiculo.findOne({ where: { renavan } });
      if (renavamExistente) return res.status(409).json({ erro: 'RENAVAN já cadastrado' });
    }

    if (entregadorId) {
      const entregador = await Entregador.findByPk(entregadorId);
      if (!entregador) return res.status(404).json({ erro: 'Entregador não encontrado' });
    }

    const veiculo = await Veiculo.create({ tipo, modelo, placa, cor, ano, renavan, status, entregadorId });

    const veiculoCompleto = await Veiculo.findByPk(veiculo.id, {
      include: [{ model: Entregador, as: 'entregador', attributes: ['id', 'nomeCompleto'] }],
    });
    res.status(201).json(veiculoCompleto);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao criar veículo', detalhe: error.message });
  }
};

// PUT /veiculos/:id
const atualizar = async (req, res) => {
  try {
    const veiculo = await Veiculo.findByPk(req.params.id);
    if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });

    const { tipo, modelo, placa, cor, ano, renavan, status, entregadorId } = req.body;

    if (placa && placa !== veiculo.placa) {
      const existe = await Veiculo.findOne({ where: { placa } });
      if (existe) return res.status(409).json({ erro: 'Placa já cadastrada' });
    }

    if (renavan && renavan !== veiculo.renavan) {
      const existe = await Veiculo.findOne({ where: { renavan } });
      if (existe) return res.status(409).json({ erro: 'RENAVAN já cadastrado' });
    }

    await veiculo.update({ tipo, modelo, placa, cor, ano, renavan, status, entregadorId });

    const veiculoAtualizado = await Veiculo.findByPk(veiculo.id, {
      include: [{ model: Entregador, as: 'entregador', attributes: ['id', 'nomeCompleto'] }],
    });
    res.json(veiculoAtualizado);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map(e => e.message) });
    }
    res.status(500).json({ erro: 'Erro ao atualizar veículo', detalhe: error.message });
  }
};

// DELETE /veiculos/:id
const remover = async (req, res) => {
  try {
    const veiculo = await Veiculo.findByPk(req.params.id);
    if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado' });

    // Bloqueio de remoção com entregador vinculado (RN)
    if (veiculo.entregadorId) {
      return res.status(409).json({ erro: 'Não é possível remover um veículo com entregador vinculado' });
    }

    await veiculo.destroy();
    res.json({ mensagem: 'Veículo removido com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover veículo', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
