const EntregaService = require('../services/EntregaService');

const listar = async (req, res) => {
  try {
    res.json(await EntregaService.findAll());
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar entregas', detalhe: error.message });
  }
};

const buscarPorId = async (req, res) => {
  try {
    res.json(await EntregaService.findById(req.params.id));
  } catch (error) {
    const status = error.message.includes('não encontrado') ? 404 : 500;
    res.status(status).json({ erro: error.message });
  }
};

const atribuirEntregador = async (req, res) => {
  try {
    const { entregadorId } = req.body;
    res.json(await EntregaService.atribuirEntregador(req.params.id, entregadorId));
  } catch (error) {
    const status = error.message.includes('não encontrado') ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

const confirmarEntrega = async (req, res) => {
  try {
    res.json(await EntregaService.confirmarEntrega(req.params.id));
  } catch (error) {
    const status = error.message.includes('não encontrado') ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

const cancelarEntrega = async (req, res) => {
  try {
    res.json(await EntregaService.remove(req.params.id));
  } catch (error) {
    const status = error.message.includes('não encontrado') ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

const avaliar = async (req, res) => {
  try {
    res.status(201).json(await EntregaService.avaliar(req));
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map((e) => e.message) });
    }
    const status = error.message.includes('não encontrado') ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

module.exports = { listar, buscarPorId, atribuirEntregador, confirmarEntrega, cancelarEntrega, avaliar };
