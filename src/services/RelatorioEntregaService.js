/**
 * RelatorioEntregaService
 *
 * Relatórios analíticos do processo de entrega do TurboFood
 *
 * REL01 – Quantidade de entregas concluídas (filtro por período e por entregador)
 * REL02 – Horas trabalhadas por entregador ativo (filtro por dia, ciclos de 24h)
 */

const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

class RelatorioEntregaService {

  /**
   * REL01 – Relatório de Entregas Concluídas
   *
   * Totaliza e detalha as entregas com status ENTREGUE,
   * agrupadas por entregador, com filtros opcionais de período e entregador.
   *
   * @param {Object} filtros
   * @param {string} [filtros.dataInicio]   Data inicial (YYYY-MM-DD)
   * @param {string} [filtros.dataFim]      Data final   (YYYY-MM-DD)
   * @param {number} [filtros.entregadorId] ID do entregador
   * @returns {Promise<Object>} Totalizações e detalhe por entregador
   */
  static async relatorioEntregasConcluidas({ dataInicio, dataFim, entregadorId } = {}) {
    const condicoes = ["ent.status = 'ENTREGUE'"];
    const replacements = {};

    if (dataInicio) {
      condicoes.push('ent.dataConclusao >= :dataInicio');
      replacements.dataInicio = `${dataInicio} 00:00:00`;
    }

    if (dataFim) {
      condicoes.push('ent.dataConclusao <= :dataFim');
      replacements.dataFim = `${dataFim} 23:59:59`;
    }

    if (entregadorId) {
      condicoes.push('ent.entregadorId = :entregadorId');
      replacements.entregadorId = Number(entregadorId);
    }

    const clausulaWhere = condicoes.join(' AND ');

    const query = `
      SELECT
        e.id                      AS entregadorId,
        e.nomeCompleto            AS entregador,
        e.status                  AS statusEntregador,
        COUNT(ent.id)             AS totalEntregas,
        MIN(ent.dataConclusao)    AS primeiraEntrega,
        MAX(ent.dataConclusao)    AS ultimaEntrega
      FROM entregas ent
      INNER JOIN entregadores e ON e.id = ent.entregadorId
      WHERE ${clausulaWhere}
      GROUP BY e.id, e.nomeCompleto, e.status
      ORDER BY totalEntregas DESC
    `;

    const porEntregador = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements,
    });

    const totalGeral = porEntregador.reduce(
      (soma, linha) => soma + Number(linha.totalEntregas),
      0,
    );

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
   * REL02 – Relatório de Horas Trabalhadas por Entregador Ativo
   *
   * Para cada entregador ativo (status ativo ou em_entrega), calcula o total
   * de minutos/horas trabalhados em um ciclo de 24h (dia calendário).
   * Indica quem atingiu o limite de jornada de 8h (RN02).
   *
   * @param {Object} filtros
   * @param {string} [filtros.data] Dia no formato YYYY-MM-DD (padrão: hoje)
   * @returns {Promise<Object>} Resumo do ciclo e detalhe por entregador
   */
  static async relatorioHorasTrabalhadasPorEntregador({ data } = {}) {
    const diaFiltro = data || new Date().toISOString().split('T')[0];
    const inicioCiclo = `${diaFiltro} 00:00:00`;
    const fimCiclo = `${diaFiltro} 23:59:59`;

    /*
     * Usa julianday() do SQLite para calcular a diferença em minutos entre
     * dataSaida e dataConclusao de cada entrega concluída no ciclo de 24h.
     * LEFT JOIN garante que entregadores sem entregas no período apareçam com 0.
     */
    const query = `
      SELECT
        e.id                        AS entregadorId,
        e.nomeCompleto              AS entregador,
        e.status                    AS statusAtual,
        COUNT(ent.id)               AS totalEntregas,
        COALESCE(SUM(
          CASE
            WHEN ent.dataSaida IS NOT NULL AND ent.dataConclusao IS NOT NULL
            THEN CAST(
              (julianday(ent.dataConclusao) - julianday(ent.dataSaida)) * 24 * 60
              AS INTEGER
            )
            ELSE 0
          END
        ), 0)                       AS minutosTrabalhados,
        ROUND(COALESCE(SUM(
          CASE
            WHEN ent.dataSaida IS NOT NULL AND ent.dataConclusao IS NOT NULL
            THEN CAST(
              (julianday(ent.dataConclusao) - julianday(ent.dataSaida)) * 24 * 60
              AS INTEGER
            )
            ELSE 0
          END
        ), 0) / 60.0, 2)            AS horasTrabalhadas,
        480 - COALESCE(SUM(
          CASE
            WHEN ent.dataSaida IS NOT NULL AND ent.dataConclusao IS NOT NULL
            THEN CAST(
              (julianday(ent.dataConclusao) - julianday(ent.dataSaida)) * 24 * 60
              AS INTEGER
            )
            ELSE 0
          END
        ), 0)                       AS minutosDisponiveis
      FROM entregadores e
      LEFT JOIN entregas ent
        ON  ent.entregadorId = e.id
        AND ent.status = 'ENTREGUE'
        AND ent.dataSaida IS NOT NULL
        AND ent.dataConclusao IS NOT NULL
        AND ent.dataConclusao BETWEEN :inicioCiclo AND :fimCiclo
      WHERE e.status IN ('ativo', 'em_entrega')
      GROUP BY e.id, e.nomeCompleto, e.status
      ORDER BY minutosTrabalhados DESC
    `;

    const linhas = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { inicioCiclo, fimCiclo },
    });

    const LIMITE_MINUTOS = 480;

    const porEntregador = linhas.map((linha) => ({
      entregadorId: linha.entregadorId,
      entregador: linha.entregador,
      statusAtual: linha.statusAtual,
      totalEntregas: Number(linha.totalEntregas),
      minutosTrabalhados: Number(linha.minutosTrabalhados),
      horasTrabalhadas: Number(linha.horasTrabalhadas),
      minutosDisponiveis: Math.max(0, Number(linha.minutosDisponiveis)),
      horasDisponiveis: Math.max(0, Number(linha.minutosDisponiveis) / 60).toFixed(2),
      percentualJornada: Math.min(
        100,
        ((Number(linha.minutosTrabalhados) / LIMITE_MINUTOS) * 100).toFixed(1),
      ),
      limiteJornadaAtingido: Number(linha.minutosTrabalhados) >= LIMITE_MINUTOS,
    }));

    return {
      filtros: {
        data: diaFiltro,
        inicioCiclo,
        fimCiclo,
      },
      limiteJornada: {
        minutos: LIMITE_MINUTOS,
        horas: 8,
        descricao: 'RN02 – máximo 8h de trabalho em ciclo de 24h',
      },
      totalEntregadores: porEntregador.length,
      entregadoresComLimiteAtingido: porEntregador.filter((e) => e.limiteJornadaAtingido).length,
      porEntregador,
    };
  }
}

module.exports = RelatorioEntregaService;
