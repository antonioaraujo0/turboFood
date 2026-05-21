const PedidoService = require("../services/PedidoService");

const listar = async (req, res) => {
  try {
    const pedidos = await PedidoService.findAll();
    res.json(pedidos);
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao listar pedidos", detalhe: error.message });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const pedido = await PedidoService.findById(req.params.id);
    res.json(pedido);
  } catch (error) {
    const status = error.message.includes("não encontrado") ? 404 : 500;
    res.status(status).json({ erro: error.message });
  }
};

const criar = async (req, res) => {
  try {
    const pedido = await PedidoService.create(req);
    res.status(201).json(pedido);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ erro: error.errors.map((e) => e.message) });
    }
    const status = error.message.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

const atualizar = async (req, res) => {
  try {
    const pedido = await PedidoService.update(req.params.id, req);
    res.json(pedido);
  } catch (error) {
    const status = error.message.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

const remover = async (req, res) => {
  try {
    const resultado = await PedidoService.remove(req.params.id);
    res.json(resultado);
  } catch (error) {
    const status = error.message.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

const avancarStatus = async (req, res) => {
  try {
    const pedido = await PedidoService.avancarStatus(req.params.id);
    res.json(pedido);
  } catch (error) {
    const status = error.message.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  avancarStatus,
};
