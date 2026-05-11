const PagamentoService = require("../services/PagamentoService");

const listar = async (req, res) => {
  try {
    res.json(await PagamentoService.findAll());
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao listar pagamentos", detalhe: error.message });
  }
};

const buscarPorId = async (req, res) => {
  try {
    res.json(await PagamentoService.findById(req.params.id));
  } catch (error) {
    const status = error.message.includes("não encontrado") ? 404 : 500;
    res.status(status).json({ erro: error.message });
  }
};

const criar = async (req, res) => {
  try {
    const pagamento = await PagamentoService.create(req);
    res.status(201).json(pagamento);
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
    res.json(await PagamentoService.update(req.params.id, req));
  } catch (error) {
    const status = error.message.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

const remover = async (req, res) => {
  try {
    res.json(await PagamentoService.remove(req.params.id));
  } catch (error) {
    const status = error.message.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
