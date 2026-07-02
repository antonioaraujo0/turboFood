const EntregaService = require("../services/EntregaService");

// Mapeia mensagens de erro para códigos HTTP adequados.
function statusFromError(message = "") {
  if (message.includes("não encontrad")) return 404;
  return 400;
}

// GET /entrega  (aceita ?status= e ?entregadorId=)
const listar = async (req, res) => {
  try {
    const { status, entregadorId } = req.query;
    const filtros = {};
    if (status) filtros.status = status;
    if (entregadorId) filtros.entregadorId = Number(entregadorId);
    res.json(await EntregaService.listar(filtros));
  } catch (error) {
    res
      .status(500)
      .json({ erro: "Erro ao listar entregas", detalhe: error.message });
  }
};

// GET /entrega/:id
const buscarPorId = async (req, res) => {
  try {
    res.json(await EntregaService.buscarPorId(req.params.id));
  } catch (error) {
    res.status(statusFromError(error.message)).json({ erro: error.message });
  }
};

// POST /entrega  { entregadorId, pedidosIds: [] }
// RN01 (máx 5 pedidos) e RN02 (jornada 8h/24h) validadas no service.
const criar = async (req, res) => {
  try {
    res.status(201).json(await EntregaService.criar(req.body));
  } catch (error) {
    res.status(statusFromError(error.message)).json({ erro: error.message });
  }
};

// POST /entrega/:id/pedidos  { pedidoId }
const adicionarPedido = async (req, res) => {
  try {
    const { pedidoId } = req.body;
    res.json(await EntregaService.adicionarPedido(req.params.id, pedidoId));
  } catch (error) {
    res.status(statusFromError(error.message)).json({ erro: error.message });
  }
};

// POST /entrega/:id/iniciar  → EM_ROTA
const iniciar = async (req, res) => {
  try {
    res.json(await EntregaService.iniciarEntrega(req.params.id));
  } catch (error) {
    res.status(statusFromError(error.message)).json({ erro: error.message });
  }
};

// POST /entrega/:id/finalizar  → ENTREGUE
const finalizar = async (req, res) => {
  try {
    res.json(await EntregaService.finalizarEntrega(req.params.id));
  } catch (error) {
    res.status(statusFromError(error.message)).json({ erro: error.message });
  }
};

// POST /entrega/:id/falhar  { motivoFalha }
const falhar = async (req, res) => {
  try {
    const { motivoFalha } = req.body;
    res.json(await EntregaService.falharEntrega(req.params.id, motivoFalha));
  } catch (error) {
    res.status(statusFromError(error.message)).json({ erro: error.message });
  }
};

// GET /entrega/entregador/:entregadorId/jornada  (RN02 - estatísticas)
const jornada = async (req, res) => {
  try {
    res.json(
      await EntregaService.obterEstatisticasJornada(
        Number(req.params.entregadorId)
      )
    );
  } catch (error) {
    res.status(statusFromError(error.message)).json({ erro: error.message });
  }
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  adicionarPedido,
  iniciar,
  finalizar,
  falhar,
  jornada,
};
