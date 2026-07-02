/**
 * RelatorioEntregaService
 *
 * Relatórios analíticos do processo de entrega do TurboFood
 *
 * REL01 – Quantidade de entregas concluídas (filtro por período e por entregador)
 * REL02 – Horas trabalhadas por entregador ativo (filtro por dia, ciclos de 24h)
 *
 * Implementado com o ORM do Sequelize e cálculo em JS — portável entre
 * Postgres (Render) e SQLite (dev). Não usa SQL cru nem funções específicas de
 * um dialeto (ex.: julianday()).
 */

const { Op } = require("sequelize");
const { Entrega, Entregador } = require("../models");

const LIMITE_MINUTOS = 480; // RN02 – 8h

// Minutos entre dataSaida e dataConclusao de uma entrega.
function minutosDaEntrega(entrega) {
  if (!entrega.dataSaida || !entrega.dataConclusao) return 0;
  const ms = new Date(entrega.dataConclusao) - new Date(entrega.dataSaida);
  return ms > 0 ? Math.floor(ms / 60000) : 0;
}

class RelatorioEntregaService {
  /**
   * REL01 – Relatório de Entregas Concluídas
   * Totaliza as entregas ENTREGUE, agrupadas por entregador, com filtros
   * opcionais de período (dataConclusao) e entregador.
   */
  static async relatorioEntregasConcluidas({ dataInicio, dataFim, entregadorId } = {}) {
    const where = { status: "ENTREGUE" };

    if (dataInicio || dataFim) {
      where.dataConclusao = {};
      if (dataInicio) where.dataConclusao[Op.gte] = `${dataInicio} 00:00:00`;
      if (dataFim) where.dataConclusao[Op.lte] = `${dataFim} 23:59:59`;
    }
    if (entregadorId) where.entregadorId = Number(entregadorId);

    const entregas = await Entrega.findAll({
      where,
      include: [
        {
          association: "entregador",
          attributes: ["id", "nomeCompleto", "status"],
        },
      ],
    });

    // Agrupa por entregador
    const mapa = {};
    for (const e of entregas) {
      const j = e.toJSON();
      const ent = j.entregador;
      if (!ent) continue;
      if (!mapa[ent.id]) {
        mapa[ent.id] = {
          entregadorId: ent.id,
          entregador: ent.nomeCompleto,
          statusEntregador: ent.status,
          totalEntregas: 0,
          primeiraEntrega: null,
          ultimaEntrega: null,
        };
      }
      const linha = mapa[ent.id];
      linha.totalEntregas += 1;
      const dc = j.dataConclusao;
      if (dc) {
        if (!linha.primeiraEntrega || new Date(dc) < new Date(linha.primeiraEntrega))
          linha.primeiraEntrega = dc;
        if (!linha.ultimaEntrega || new Date(dc) > new Date(linha.ultimaEntrega))
          linha.ultimaEntrega = dc;
      }
    }

    const porEntregador = Object.values(mapa).sort(
      (a, b) => b.totalEntregas - a.totalEntregas
    );
    const totalGeral = porEntregador.reduce((s, l) => s + l.totalEntregas, 0);

    return {
      filtros: {
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        entregadorId: entregadorId ? Number(entregadorId) : null,
      },
      totalGeral,
      totalEntregadores: porEntregador.length,
      porEntregador,
    };
  }

  /**
   * REL02 – Horas Trabalhadas por Entregador Ativo
   * Para cada entregador ativo (ativo/em_entrega), soma os minutos trabalhados
   * (dataSaida → dataConclusao) nas entregas ENTREGUE dentro do ciclo do dia.
   * Indica quem atingiu o limite de jornada de 8h (RN02).
   */
  static async relatorioHorasTrabalhadasPorEntregador({ data } = {}) {
    const diaFiltro = data || new Date().toISOString().split("T")[0];
    const inicioCiclo = `${diaFiltro} 00:00:00`;
    const fimCiclo = `${diaFiltro} 23:59:59`;

    const entregadores = await Entregador.findAll({
      where: { status: { [Op.in]: ["ativo", "em_entrega"] } },
      attributes: ["id", "nomeCompleto", "status"],
      include: [
        {
          association: "entregas",
          required: false,
          where: {
            status: "ENTREGUE",
            dataSaida: { [Op.not]: null },
            dataConclusao: { [Op.between]: [inicioCiclo, fimCiclo] },
          },
          attributes: ["id", "dataSaida", "dataConclusao"],
        },
      ],
    });

    const porEntregador = entregadores
      .map((e) => {
        const j = e.toJSON();
        const entregas = j.entregas || [];
        const minutos = entregas.reduce((s, ent) => s + minutosDaEntrega(ent), 0);
        const minutosDisponiveis = Math.max(0, LIMITE_MINUTOS - minutos);
        return {
          entregadorId: j.id,
          entregador: j.nomeCompleto,
          statusAtual: j.status,
          totalEntregas: entregas.length,
          minutosTrabalhados: minutos,
          horasTrabalhadas: Number((minutos / 60).toFixed(2)),
          minutosDisponiveis,
          horasDisponiveis: (minutosDisponiveis / 60).toFixed(2),
          percentualJornada: Math.min(
            100,
            Number(((minutos / LIMITE_MINUTOS) * 100).toFixed(1))
          ),
          limiteJornadaAtingido: minutos >= LIMITE_MINUTOS,
        };
      })
      .sort((a, b) => b.minutosTrabalhados - a.minutosTrabalhados);

    return {
      filtros: { data: diaFiltro, inicioCiclo, fimCiclo },
      limiteJornada: {
        minutos: LIMITE_MINUTOS,
        horas: 8,
        descricao: "RN02 – máximo 8h de trabalho em ciclo de 24h",
      },
      totalEntregadores: porEntregador.length,
      entregadoresComLimiteAtingido: porEntregador.filter(
        (e) => e.limiteJornadaAtingido
      ).length,
      porEntregador,
    };
  }
}

module.exports = RelatorioEntregaService;
