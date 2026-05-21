/**
 * RelatorioAvaliacaoService.js
 *
 * Relatórios do processo de avaliação.
 *
 * Relatório 1 – Avaliações por Bairro e Período
 *   Filtragem:  período de datas (WHERE)
 *   Agregação:  total de avaliações, média de nota da comida e da entrega por bairro (GROUP BY)
 *
 * Relatório 2 – Desempenho de Entregadores por Período
 *   Filtragem:  período de datas + somente entregas concluídas (WHERE)
 *   Agregação:  total de entregas, médias e total de avaliações negativas por entregador (GROUP BY)
 */

const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

/**
 * Relatório 1 – Avaliações por Bairro e Período.
 *
 * Identifica quais regiões concentram as melhores ou piores avaliações,
 * útil para decisões de logística e atendimento.
 * Ordenado pelos bairros com pior média de entrega primeiro.
 */
async function findAvaliacoesByBairroAndPeriodo(req) {
  const { inicio, termino } = req.params;

  const objs = await sequelize.query(
    `SELECT
       en.bairro                           AS bairro,
       en.cidade                           AS cidade,
       COUNT(av.id)                        AS totalAvaliacoes,
       ROUND(AVG(av.notaComida),  2)       AS mediaNotaComida,
       ROUND(AVG(av.notaEntrega), 2)       AS mediaNotaEntrega
     FROM Avaliacoes av
     INNER JOIN Pedidos   p  ON p.id  = av.pedidoId
     INNER JOIN Enderecos en ON en.id = p.enderecoId
     WHERE av.createdAt BETWEEN :inicio AND :termino
     GROUP BY en.bairro, en.cidade
     ORDER BY mediaNotaEntrega ASC`,
    {
      replacements: { inicio, termino },
      type: QueryTypes.SELECT,
    }
  );

  return objs;
}

/**
 * Relatório 2 – Desempenho de Entregadores por Período.
 *
 * Ranking de desempenho dos entregadores com total de entregas,
 * médias de nota e total de avaliações negativas.
 * Útil para monitorar quem está em risco de corte pela RN01.
 * Ordenado pelos entregadores com pior média de entrega primeiro.
 */
async function findDesempenhoEntregadoresByPeriodo(req) {
  const { inicio, termino } = req.params;

  const objs = await sequelize.query(
    `SELECT
       et.nome                                                AS nomeEntregador,
       et.ativo,
       COUNT(e.id)                                            AS totalEntregas,
       ROUND(AVG(av.notaEntrega), 2)                          AS mediaNotaEntrega,
       ROUND(AVG(av.notaComida),  2)                          AS mediaNotaComida,
       SUM(CASE WHEN av.notaEntrega < 2 THEN 1 ELSE 0 END)   AS totalAvaliacoesNegativas
     FROM Entregadores et
     INNER JOIN Entregas   e  ON e.entregadorId = et.id
     INNER JOIN Pedidos    p  ON p.id           = e.pedidoId
     INNER JOIN Avaliacoes av ON av.pedidoId    = p.id
     WHERE e.status        = 'ENTREGUE'
       AND e.dataConclusao BETWEEN :inicio AND :termino
     GROUP BY et.id, et.nome, et.ativo
     ORDER BY mediaNotaEntrega ASC`,
    {
      replacements: { inicio, termino },
      type: QueryTypes.SELECT,
    }
  );

  return objs;
}

module.exports = { findAvaliacoesByBairroAndPeriodo, findDesempenhoEntregadoresByPeriodo };
