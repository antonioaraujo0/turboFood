/**
 * EntregaService
 *
 * Serviço responsável pela gestão de entregas do sistema TurboFood
 *
 * Regras de Negócio:
 *  RN01 – Limite de 5 pedidos por entrega
 *  RN02 – Controle de Jornada: máximo 8h de trabalho seguidas nas últimas 24h
 */

const { Op } = require("sequelize");
const db = require("../models");

const { Entrega, Pedido, Entregador, sequelize } = db;

class EntregaService {
  /**
   * RN01 - Validar limite de pedidos por entrega
   * Máximo de 5 pedidos vinculados a uma entrega
   *
   * @param {number} entregaId - ID da entrega
   * @param {Transaction} transaction - Transação do Sequelize
   * @throws {Error} Se o limite de pedidos for excedido
   */
  static async validarLimitePedidos(entregaId, transaction) {
    const quantidadePedidos = await Pedido.count({
      where: { entregaId },
      transaction,
    });

    if (quantidadePedidos >= 5) {
      throw new Error(
        `Limite de pedidos atingido. A entrega já possui ${quantidadePedidos} pedido(s). ` +
          "O máximo permitido é 5 pedidos por entrega.",
      );
    }

    return quantidadePedidos;
  }

  /**
   * RN02 - Validar jornada de trabalho do entregador
   * Calcula o tempo real trabalhado nas últimas 24h baseado nas entregas concluídas
   * Bloqueia se o entregador já trabalhou >= 8h (480 minutos)
   *
   * @param {number} entregadorId - ID do entregador
   * @param {Transaction} transaction - Transação do Sequelize
   * @throws {Error} Se o limite de jornada for excedido
   */
  static async validarJornadaTrabalho(entregadorId, transaction) {
    // Definir limite de 24 horas atrás
    const limite24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Buscar entregas concluídas nas últimas 24h com data de saída e conclusão
    const entregasRecentes = await Entrega.findAll({
      where: {
        entregadorId,
        status: "ENTREGUE",
        dataConclusao: {
          [Op.gte]: limite24h,
        },
        dataSaida: {
          [Op.not]: null,
        },
      },
      attributes: ["id", "dataSaida", "dataConclusao"],
      transaction,
    });

    // Calcular tempo total trabalhado em minutos
    let minutosTotais = 0;

    for (const entrega of entregasRecentes) {
      if (entrega.dataSaida && entrega.dataConclusao) {
        const inicio = new Date(entrega.dataSaida);
        const fim = new Date(entrega.dataConclusao);
        const diferencaMs = fim - inicio;
        const minutos = Math.floor(diferencaMs / (1000 * 60));
        minutosTotais += minutos;
      }
    }

    // Validar limite de 8 horas (480 minutos)
    const LIMITE_MINUTOS = 480;

    if (minutosTotais >= LIMITE_MINUTOS) {
      const horasTrabalhadas = (minutosTotais / 60).toFixed(2);
      throw new Error(
        `Jornada de trabalho excedida. O entregador já trabalhou ${horasTrabalhadas}h nas últimas 24 horas. ` +
          `O limite é de 8 horas (${LIMITE_MINUTOS} minutos).`,
      );
    }

    return {
      minutosTrabalhados: minutosTotais,
      minutosDisponiveis: LIMITE_MINUTOS - minutosTotais,
      horasTrabalhadas: (minutosTotais / 60).toFixed(2),
    };
  }

  /**
   * Criar uma nova entrega
   * Valida todas as regras de negócio usando transação
   *
   * @param {Object} dados - Dados da entrega
   * @param {number} dados.entregadorId - ID do entregador
   * @param {number[]} dados.pedidosIds - Array com IDs dos pedidos
   * @returns {Promise<Entrega>} Entrega criada
   */
  static async criar(dados) {
    const { entregadorId, pedidosIds } = dados;

    // Validações básicas
    if (!entregadorId) {
      throw new Error("Entregador é obrigatório");
    }

    if (!pedidosIds || !Array.isArray(pedidosIds) || pedidosIds.length === 0) {
      throw new Error("É necessário informar pelo menos um pedido");
    }

    // RN01 - Validar limite de pedidos
    if (pedidosIds.length > 5) {
      throw new Error(
        `Não é possível criar entrega com ${pedidosIds.length} pedidos. ` +
          "O limite é de 5 pedidos por entrega.",
      );
    }

    // Iniciar transação
    const transaction = await sequelize.transaction();

    try {
      // Verificar se entregador existe e está ativo
      const entregador = await Entregador.findByPk(entregadorId, {
        transaction,
      });

      if (!entregador) {
        throw new Error("Entregador não encontrado");
      }

      if (entregador.status !== "ativo") {
        throw new Error(
          `Entregador "${entregador.nomeCompleto}" não está disponível. ` +
            `Status atual: ${entregador.status}`,
        );
      }

      // RN02 - Validar jornada de trabalho
      const jornadaInfo = await this.validarJornadaTrabalho(
        entregadorId,
        transaction,
      );

      console.log(
        `[INFO] Entregador ${entregador.nomeCompleto} - Jornada: ${jornadaInfo.horasTrabalhadas}h trabalhadas nas últimas 24h`,
      );

      // Criar a entrega
      const entrega = await Entrega.create(
        {
          entregadorId,
          dataSaida: new Date(),
          status: "AGUARDANDO",
        },
        { transaction },
      );

      // Vincular pedidos à entrega
      await Pedido.update(
        { entregaId: entrega.id },
        {
          where: {
            id: {
              [Op.in]: pedidosIds,
            },
          },
          transaction,
        },
      );

      // Atualizar status do entregador para 'em_entrega'
      await entregador.update({ status: "em_entrega" }, { transaction });

      // Commit da transação
      await transaction.commit();

      // Retornar entrega com dados completos
      return await this.buscarPorId(entrega.id);
    } catch (error) {
      // Rollback em caso de erro
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Adicionar pedido a uma entrega existente
   * Valida RN01 antes de adicionar
   *
   * @param {number} entregaId - ID da entrega
   * @param {number} pedidoId - ID do pedido
   * @returns {Promise<Entrega>} Entrega atualizada
   */
  static async adicionarPedido(entregaId, pedidoId) {
    const transaction = await sequelize.transaction();

    try {
      // Verificar se a entrega existe
      const entrega = await Entrega.findByPk(entregaId, { transaction });

      if (!entrega) {
        throw new Error("Entrega não encontrada");
      }

      // Validar se a entrega ainda está em andamento
      if (entrega.status === "ENTREGUE" || entrega.status === "FALHOU") {
        throw new Error(
          `Não é possível adicionar pedidos a uma entrega com status "${entrega.status}"`,
        );
      }

      // RN01 - Validar limite de pedidos
      await this.validarLimitePedidos(entregaId, transaction);

      // Verificar se o pedido existe
      const pedido = await Pedido.findByPk(pedidoId, { transaction });

      if (!pedido) {
        throw new Error("Pedido não encontrado");
      }

      // Verificar se o pedido já está vinculado a outra entrega
      if (pedido.entregaId && pedido.entregaId !== entregaId) {
        throw new Error("Este pedido já está vinculado a outra entrega");
      }

      // Vincular pedido à entrega
      await pedido.update({ entregaId }, { transaction });

      await transaction.commit();

      return await this.buscarPorId(entregaId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Iniciar entrega (mudar status para EM_ROTA)
   *
   * @param {number} entregaId - ID da entrega
   * @returns {Promise<Entrega>} Entrega atualizada
   */
  static async iniciarEntrega(entregaId) {
    const transaction = await sequelize.transaction();

    try {
      const entrega = await Entrega.findByPk(entregaId, { transaction });

      if (!entrega) {
        throw new Error("Entrega não encontrada");
      }

      if (entrega.status !== "AGUARDANDO") {
        throw new Error(
          `Não é possível iniciar entrega com status "${entrega.status}". ` +
            'Apenas entregas com status "AGUARDANDO" podem ser iniciadas.',
        );
      }

      // Atualizar status e data de saída
      await entrega.update(
        {
          status: "EM_ROTA",
          dataSaida: new Date(),
        },
        { transaction },
      );

      await transaction.commit();

      return await this.buscarPorId(entregaId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Finalizar entrega (marcar como ENTREGUE)
   * Libera o entregador se não houver mais entregas em andamento
   *
   * @param {number} entregaId - ID da entrega
   * @returns {Promise<Entrega>} Entrega atualizada
   */
  static async finalizarEntrega(entregaId) {
    const transaction = await sequelize.transaction();

    try {
      const entrega = await Entrega.findByPk(entregaId, {
        include: [{ model: Entregador, as: "entregador" }],
        transaction,
      });

      if (!entrega) {
        throw new Error("Entrega não encontrada");
      }

      if (entrega.status !== "EM_ROTA") {
        throw new Error(
          `Não é possível finalizar entrega com status "${entrega.status}". ` +
            'Apenas entregas com status "EM_ROTA" podem ser finalizadas.',
        );
      }

      // Atualizar status e data de conclusão
      await entrega.update(
        {
          status: "ENTREGUE",
          dataConclusao: new Date(),
        },
        { transaction },
      );

      // Verificar se o entregador tem outras entregas em andamento
      const entregasEmAndamento = await Entrega.count({
        where: {
          entregadorId: entrega.entregadorId,
          status: {
            [Op.in]: ["AGUARDANDO", "EM_ROTA"],
          },
          id: {
            [Op.ne]: entregaId,
          },
        },
        transaction,
      });

      // Se não houver mais entregas em andamento, liberar o entregador
      if (entregasEmAndamento === 0 && entrega.entregador) {
        await entrega.entregador.update({ status: "ativo" }, { transaction });
      }

      await transaction.commit();

      return await this.buscarPorId(entregaId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Marcar entrega como FALHOU
   * Libera o entregador
   *
   * @param {number} entregaId - ID da entrega
   * @param {string} motivoFalha - Motivo da falha
   * @returns {Promise<Entrega>} Entrega atualizada
   */
  static async falharEntrega(entregaId, motivoFalha) {
    const transaction = await sequelize.transaction();

    try {
      const entrega = await Entrega.findByPk(entregaId, {
        include: [{ model: Entregador, as: "entregador" }],
        transaction,
      });

      if (!entrega) {
        throw new Error("Entrega não encontrada");
      }

      if (entrega.status === "ENTREGUE") {
        throw new Error(
          "Não é possível marcar como falha uma entrega já concluída",
        );
      }

      // Atualizar status, data de conclusão e motivo da falha
      await entrega.update(
        {
          status: "FALHOU",
          dataConclusao: new Date(),
          motivoFalha: motivoFalha || null,
        },
        { transaction },
      );

      // Verificar se o entregador tem outras entregas em andamento
      const entregasEmAndamento = await Entrega.count({
        where: {
          entregadorId: entrega.entregadorId,
          status: {
            [Op.in]: ["AGUARDANDO", "EM_ROTA"],
          },
          id: {
            [Op.ne]: entregaId,
          },
        },
        transaction,
      });

      // Se não houver mais entregas em andamento, liberar o entregador
      if (entregasEmAndamento === 0 && entrega.entregador) {
        await entrega.entregador.update({ status: "ativo" }, { transaction });
      }

      await transaction.commit();

      return await this.buscarPorId(entregaId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Buscar entrega por ID com relacionamentos
   *
   * @param {number} id - ID da entrega
   * @returns {Promise<Entrega>} Entrega encontrada
   */
  static async buscarPorId(id) {
    const entrega = await Entrega.findByPk(id, {
      include: [
        {
          model: Entregador,
          as: "entregador",
          attributes: { exclude: ["senha"] },
        },
        {
          model: Pedido,
          as: "pedidos",
        },
      ],
    });

    if (!entrega) {
      throw new Error("Entrega não encontrada");
    }

    return entrega;
  }

  /**
   * Listar todas as entregas com filtros opcionais
   *
   * @param {Object} filtros - Filtros opcionais
   * @param {string} filtros.status - Status da entrega
   * @param {number} filtros.entregadorId - ID do entregador
   * @returns {Promise<Entrega[]>} Lista de entregas
   */
  static async listar(filtros = {}) {
    const where = {};

    if (filtros.status) {
      where.status = filtros.status;
    }

    if (filtros.entregadorId) {
      where.entregadorId = filtros.entregadorId;
    }

    return await Entrega.findAll({
      where,
      include: [
        {
          model: Entregador,
          as: "entregador",
          attributes: { exclude: ["senha"] },
        },
        {
          model: Pedido,
          as: "pedidos",
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Obter estatísticas de jornada do entregador
   *
   * @param {number} entregadorId - ID do entregador
   * @returns {Promise<Object>} Estatísticas de jornada
   */
  static async obterEstatisticasJornada(entregadorId) {
    const transaction = await sequelize.transaction();

    try {
      const jornadaInfo = await this.validarJornadaTrabalho(
        entregadorId,
        transaction,
      );

      await transaction.commit();

      return {
        entregadorId,
        minutosTrabalhados: jornadaInfo.minutosTrabalhados,
        horasTrabalhadas: jornadaInfo.horasTrabalhadas,
        minutosDisponiveis: jornadaInfo.minutosDisponiveis,
        horasDisponiveis: (jornadaInfo.minutosDisponiveis / 60).toFixed(2),
        limiteAtingido: jornadaInfo.minutosTrabalhados >= 480,
      };
    } catch (error) {
      await transaction.rollback();

      // Se o erro for de limite excedido, retornar informações mesmo assim
      if (error.message.includes("Jornada de trabalho excedida")) {
        return {
          entregadorId,
          limiteAtingido: true,
          mensagem: error.message,
        };
      }

      throw error;
    }
  }
}

module.exports = EntregaService;
