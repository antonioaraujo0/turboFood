/**
 * RelatorioAvaliacaoService.js
 *
 * Relatórios do processo de avaliação.
 *
 * Relatório 1 – Avaliações por Bairro e Período (média de comida/entrega por bairro)
 * Relatório 2 – Desempenho de Entregadores por Período (entregas, médias, negativas)
 *
 * Reescrito com o ORM do Sequelize e agregação em JS — portável Postgres/SQLite.
 * A versão anterior usava SQL cru com colunas/joins inválidos no schema atual
 * (et.nome, et.ativo, e.pedidoId, p.enderecoId, tabela Enderecos).
 */

const { Op } = require("sequelize");
const { Avaliacao, Entrega } = require("../models");

const num = (v) => Number(v || 0);
const media = (soma, qtd) => (qtd ? Number((soma / qtd).toFixed(2)) : null);

/**
 * Relatório 1 – Avaliações por Bairro e Período.
 * Ordenado pelos bairros com pior média de entrega primeiro.
 */
async function findAvaliacoesByBairroAndPeriodo(req) {
  const { inicio, termino } = req.params;

  const avaliacoes = await Avaliacao.findAll({
    where: { createdAt: { [Op.between]: [inicio, termino] } },
    include: [
      {
        association: "pedido",
        attributes: ["id"],
        include: [
          {
            association: "enderecoEntrega",
            attributes: ["bairro", "cidade"],
          },
        ],
      },
    ],
  });

  const mapa = {};
  for (const a of avaliacoes) {
    const j = a.toJSON();
    const ee = (j.pedido && j.pedido.enderecoEntrega) || {};
    const bairro = ee.bairro || "(sem bairro)";
    const cidade = ee.cidade || "(sem cidade)";
    const chave = `${bairro}||${cidade}`;
    if (!mapa[chave]) {
      mapa[chave] = {
        bairro,
        cidade,
        totalAvaliacoes: 0,
        somaComida: 0,
        somaEntrega: 0,
      };
    }
    const g = mapa[chave];
    g.totalAvaliacoes += 1;
    g.somaComida += num(j.notaComida);
    g.somaEntrega += num(j.notaEntrega);
  }

  return Object.values(mapa)
    .map((g) => ({
      bairro: g.bairro,
      cidade: g.cidade,
      totalAvaliacoes: g.totalAvaliacoes,
      mediaNotaComida: media(g.somaComida, g.totalAvaliacoes),
      mediaNotaEntrega: media(g.somaEntrega, g.totalAvaliacoes),
    }))
    .sort((a, b) => (a.mediaNotaEntrega || 0) - (b.mediaNotaEntrega || 0));
}

/**
 * Relatório 2 – Desempenho de Entregadores por Período.
 * Considera entregas ENTREGUE com dataConclusao no período.
 * Ordenado pelos entregadores com pior média de entrega primeiro.
 */
async function findDesempenhoEntregadoresByPeriodo(req) {
  const { inicio, termino } = req.params;

  const entregas = await Entrega.findAll({
    where: {
      status: "ENTREGUE",
      dataConclusao: { [Op.between]: [inicio, termino] },
    },
    include: [
      {
        association: "entregador",
        attributes: ["id", "nomeCompleto", "status"],
      },
      {
        association: "pedidos",
        attributes: ["id"],
        include: [
          { association: "avaliacao", attributes: ["notaComida", "notaEntrega"] },
        ],
      },
    ],
  });

  const mapa = {};
  for (const e of entregas) {
    const j = e.toJSON();
    const ent = j.entregador;
    if (!ent) continue;
    if (!mapa[ent.id]) {
      mapa[ent.id] = {
        entregadorId: ent.id,
        nomeEntregador: ent.nomeCompleto,
        status: ent.status,
        totalEntregas: 0,
        somaEntrega: 0,
        somaComida: 0,
        qtdAvaliacoes: 0,
        totalAvaliacoesNegativas: 0,
      };
    }
    const g = mapa[ent.id];
    g.totalEntregas += 1;
    for (const p of j.pedidos || []) {
      if (p.avaliacao) {
        g.qtdAvaliacoes += 1;
        g.somaEntrega += num(p.avaliacao.notaEntrega);
        g.somaComida += num(p.avaliacao.notaComida);
        if (num(p.avaliacao.notaEntrega) < 2) g.totalAvaliacoesNegativas += 1;
      }
    }
  }

  return Object.values(mapa)
    .map((g) => ({
      entregadorId: g.entregadorId,
      nomeEntregador: g.nomeEntregador,
      status: g.status,
      totalEntregas: g.totalEntregas,
      totalAvaliacoes: g.qtdAvaliacoes,
      mediaNotaEntrega: media(g.somaEntrega, g.qtdAvaliacoes),
      mediaNotaComida: media(g.somaComida, g.qtdAvaliacoes),
      totalAvaliacoesNegativas: g.totalAvaliacoesNegativas,
    }))
    .sort((a, b) => (a.mediaNotaEntrega || 0) - (b.mediaNotaEntrega || 0));
}

module.exports = {
  findAvaliacoesByBairroAndPeriodo,
  findDesempenhoEntregadoresByPeriodo,
};
