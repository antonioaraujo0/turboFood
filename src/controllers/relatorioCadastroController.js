/**
 * relatorioCadastroController.js
 *
 * Relatórios de Listagens — RF45 a RF52
 *
 * RF45 – GET /relatorios/categorias
 * RF46 – GET /relatorios/produtos
 * RF47 – GET /relatorios/clientes
 * RF48 – GET /relatorios/entregadores
 * RF49 – GET /relatorios/veiculos
 * RF50 – GET /relatorios/pedidos
 * RF51 – GET /relatorios/avaliacoes-cadastro
 * RF52 – GET /relatorios/pagamentos
 *
 * Padrão Código B:
 *  - Funções nomeadas em camelCase
 *  - Resposta de erro com { erro, detalhe } — igual aos demais controllers
 *  - Parâmetros lidos de req.query
 *  - Delegação total ao Service (sem lógica de negócio no controller)
 */

const RelatorioCadastroService = require('../services/RelatorioCadastroService');

// RF45 – GET /relatorios/categorias
const listarCategorias = async (req, res) => {
  try {
    const { ativo } = req.query;
    const resultado = await RelatorioCadastroService.listarCategorias({ ativo });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório de categorias',
      detalhe: error.message,
    });
  }
};

// RF46 – GET /relatorios/produtos
const listarProdutos = async (req, res) => {
  try {
    const { categoriaId, disponivel } = req.query;
    const resultado = await RelatorioCadastroService.listarProdutos({ categoriaId, disponivel });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório de produtos',
      detalhe: error.message,
    });
  }
};

// RF47 – GET /relatorios/clientes
const listarClientes = async (req, res) => {
  try {
    const { ativo, busca } = req.query;
    const resultado = await RelatorioCadastroService.listarClientes({ ativo, busca });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório de clientes',
      detalhe: error.message,
    });
  }
};

// RF48 – GET /relatorios/entregadores
const listarEntregadores = async (req, res) => {
  try {
    const { status, busca } = req.query;
    const resultado = await RelatorioCadastroService.listarEntregadores({ status, busca });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório de entregadores',
      detalhe: error.message,
    });
  }
};

// RF49 – GET /relatorios/veiculos
const listarVeiculos = async (req, res) => {
  try {
    const { status, tipo } = req.query;
    const resultado = await RelatorioCadastroService.listarVeiculos({ status, tipo });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório de veículos',
      detalhe: error.message,
    });
  }
};

// RF50 – GET /relatorios/pedidos
const listarPedidos = async (req, res) => {
  try {
    const { clienteId, status, dataInicio, dataFim, busca } = req.query;
    const resultado = await RelatorioCadastroService.listarPedidos({
      clienteId,
      status,
      dataInicio,
      dataFim,
      busca,
    });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório de pedidos',
      detalhe: error.message,
    });
  }
};

// RF51 – GET /relatorios/avaliacoes-cadastro
// Rota distinta de /relatorios/avaliacoes (já usada pelo relatorioAvaliacaoRoutes do Código B)
const listarAvaliacoes = async (req, res) => {
  try {
    const { dataInicio, dataFim, notaMin, notaMax, busca } = req.query;
    const resultado = await RelatorioCadastroService.listarAvaliacoes({
      dataInicio,
      dataFim,
      notaMin,
      notaMax,
      busca,
    });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório de avaliações',
      detalhe: error.message,
    });
  }
};

// RF52 – GET /relatorios/pagamentos
const listarPagamentos = async (req, res) => {
  try {
    const { status, forma, dataInicio, dataFim, clienteId } = req.query;
    const resultado = await RelatorioCadastroService.listarPagamentos({
      status,
      forma,
      dataInicio,
      dataFim,
      clienteId,
    });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório de pagamentos',
      detalhe: error.message,
    });
  }
};

module.exports = {
  listarCategorias,
  listarProdutos,
  listarClientes,
  listarEntregadores,
  listarVeiculos,
  listarPedidos,
  listarAvaliacoes,
  listarPagamentos,
};
