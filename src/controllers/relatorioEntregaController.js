const RelatorioEntregaService = require('../services/RelatorioEntregaService');

const entregasConcluidas = async (req, res) => {
  try {
    const { dataInicio, dataFim, entregadorId } = req.query;
    const resultado = await RelatorioEntregaService.relatorioEntregasConcluidas({
      dataInicio,
      dataFim,
      entregadorId,
    });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar relatório de entregas concluídas', detalhe: error.message });
  }
};

const horasTrabalhadasPorEntregador = async (req, res) => {
  try {
    const { data } = req.query;
    const resultado = await RelatorioEntregaService.relatorioHorasTrabalhadasPorEntregador({ data });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar relatório de horas trabalhadas', detalhe: error.message });
  }
};

module.exports = { entregasConcluidas, horasTrabalhadasPorEntregador };
