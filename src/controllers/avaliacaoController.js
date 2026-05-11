/**
 * avaliacaoController.js
 *
 * RF01  – Formulário disponível só após confirmação de entrega
 * RF02  – Nota de 1 a 5 estrelas para comida e entrega
 * RF03  – Comentário opcional em texto
 * RNF01 – Avaliação submetida não pode ter notas alteradas
 * RNF02 – Disponível 24/7
 * RN01  – Entregador desligado se média < 2 após 50 entregas
 * RN02  – Avaliação só aceita até 7 dias após conclusão da entrega
 */

const AvaliacaoService = require('../services/AvaliacaoService');

// GET /avaliacoes  — RF51: Listar avaliações
const listar = async (req, res) => {
  try {
    const avaliacoes = await AvaliacaoService.listar();
    res.json(avaliacoes);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar avaliações', detalhe: error.message });
  }
};

// GET /avaliacoes/:id  — RF44: Visualizar avaliação
const buscarPorId = async (req, res) => {
  try {
    const avaliacao = await AvaliacaoService.buscarPorId(req.params.id);
    res.json(avaliacao);
  } catch (error) {
    const status = error.message.includes('não encontrada') ? 404 : 500;
    res.status(status).json({ erro: error.message });
  }
};

// POST /avaliacoes  — RF41: Criar avaliação
const criar = async (req, res) => {
  try {
    const { pedidoId, notaComida, notaEntrega, comentario } = req.body;

    // clienteId viria do token JWT em um sistema com autenticação;
    // por ora, aceita do body para fins de desenvolvimento
    const clienteId = req.clienteId ?? req.body.clienteId;

    const avaliacao = await AvaliacaoService.avaliar({
      clienteId,
      pedidoId,
      notaComida,
      notaEntrega,
      comentario,
    });

    res.status(201).json(avaliacao);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: error.errors.map((e) => e.message) });
    }
    const status = error.message.includes('não encontrado') ? 404 : 400;
    res.status(status).json({ erro: error.message });
  }
};

// PUT /avaliacoes/:id  — RF42: Atualizar avaliação (somente comentário)
const atualizar = async (req, res) => {
  try {
    const avaliacao = await AvaliacaoService.atualizar(req.params.id, req.body);
    res.json(avaliacao);
  } catch (error) {
    if (error.message.includes('RNF01')) return res.status(403).json({ erro: error.message });
    if (error.message.includes('não encontrada')) return res.status(404).json({ erro: error.message });
    res.status(500).json({ erro: 'Erro ao atualizar avaliação', detalhe: error.message });
  }
};

// DELETE /avaliacoes/:id  — RF43: Remover avaliação (somente admin)
const remover = async (req, res) => {
  try {
    await AvaliacaoService.remover(req.params.id);
    res.json({ mensagem: 'Avaliação removida com sucesso' });
  } catch (error) {
    if (error.message.includes('não encontrada')) return res.status(404).json({ erro: error.message });
    res.status(500).json({ erro: 'Erro ao remover avaliação', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
