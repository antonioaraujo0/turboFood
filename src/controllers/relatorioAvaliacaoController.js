/**
 * relatorioAvaliacaoController.js
 *
 * Relatório 1 – GET /relatorios/avaliacoes/bairro/:inicio/:termino
 * Relatório 2 – GET /relatorios/avaliacoes/entregadores/:inicio/:termino
 */

const RelatorioAvaliacaoService = require('../services/RelatorioAvaliacaoService');

// GET /relatorios/avaliacoes/bairro/:inicio/:termino
const avaliacoesByBairroAndPeriodo = async (req, res) => {
  try {
    const objs = await RelatorioAvaliacaoService.findAvaliacoesByBairroAndPeriodo(req);
    res.json(objs);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar relatório de avaliações por bairro', detalhe: error.message });
  }
};

// GET /relatorios/avaliacoes/entregadores/:inicio/:termino
const desempenhoEntregadoresByPeriodo = async (req, res) => {
  try {
    const objs = await RelatorioAvaliacaoService.findDesempenhoEntregadoresByPeriodo(req);
    res.json(objs);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar relatório de desempenho de entregadores', detalhe: error.message });
  }
};

module.exports = { avaliacoesByBairroAndPeriodo, desempenhoEntregadoresByPeriodo };
