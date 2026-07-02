/**
 * AvaliacaoService.js
 *
 * Regras de negócio validadas via transação Sequelize (ORM — portável
 * Postgres/SQLite; a versão anterior usava SQL cru com julianday() e colunas
 * inválidas no schema atual).
 *
 * RF01  – Avaliação só disponível para entrega concluída (status ENTREGUE)
 * RF02  – Nota de 1 a 5 para comida e entrega
 * RF03  – Comentário opcional
 * RNF01 – Notas imutáveis após submissão (só o comentário pode mudar)
 * RN01  – Desligamento automático do entregador se a média (notaEntrega) for
 *         menor que 2 após acumular 50 avaliações.
 * RN02  – O cliente só pode avaliar APÓS 7 dias da confirmação da entrega.
 */

const { Op } = require("sequelize");
const { sequelize, Avaliacao, Pedido, Entrega, Entregador } = require("../models");

const DIAS_MINIMOS_PARA_AVALIAR = 7; // RN02
const MIN_AVALIACOES_PARA_CORTE = 50; // RN01
const MEDIA_MINIMA = 2.0; // RN01

// Entrega vinculada ao pedido (novo modelo: Pedido.entregaId → Entrega).
async function obterEntregaDoPedido(pedidoId, transaction) {
  const pedido = await Pedido.findByPk(pedidoId, { transaction });
  if (!pedido) throw new Error("Pedido não encontrado.");
  if (!pedido.entregaId) return null;
  return Entrega.findByPk(pedido.entregaId, { transaction });
}

/**
 * RN01 – Após o INSERT, dentro da mesma transação:
 *  1. Conta as avaliações do entregador (via entregas → pedidos → avaliação).
 *  2. Se >= 50 avaliações e a média de notaEntrega < 2, inativa o entregador.
 */
async function verificarDesligamentoEntregador(entregadorId, transaction) {
  const entregas = await Entrega.findAll({
    where: { entregadorId },
    attributes: ["id"],
    transaction,
  });
  const entregaIds = entregas.map((e) => e.id);
  if (entregaIds.length === 0) return;

  const pedidos = await Pedido.findAll({
    where: { entregaId: { [Op.in]: entregaIds } },
    attributes: ["id"],
    transaction,
  });
  const pedidoIds = pedidos.map((p) => p.id);
  if (pedidoIds.length === 0) return;

  const avaliacoes = await Avaliacao.findAll({
    where: { pedidoId: { [Op.in]: pedidoIds } },
    attributes: ["notaEntrega"],
    transaction,
  });

  if (avaliacoes.length < MIN_AVALIACOES_PARA_CORTE) return;

  const soma = avaliacoes.reduce((s, a) => s + Number(a.notaEntrega), 0);
  const mediaNota = soma / avaliacoes.length;

  if (mediaNota < MEDIA_MINIMA) {
    await Entregador.update(
      { status: "inativo" },
      { where: { id: entregadorId }, transaction }
    );
    console.warn(
      `[RN01] Entregador ${entregadorId} desligado automaticamente. ` +
        `Média: ${mediaNota.toFixed(2)} em ${avaliacoes.length} avaliações.`
    );
  }
}

/**
 * RF01 + RF02 + RF03 + RN01 + RN02 – Criar avaliação (transação atômica).
 */
async function avaliar({ clienteId, pedidoId, notaComida, notaEntrega, comentario }) {
  const transaction = await sequelize.transaction();

  try {
    // RF01 – entrega concluída
    const entrega = await obterEntregaDoPedido(pedidoId, transaction);
    if (!entrega || entrega.status !== "ENTREGUE" || !entrega.dataConclusao) {
      throw new Error(
        "RF01 – A entrega deste pedido ainda não foi concluída. Não é possível avaliar."
      );
    }

    // RN02 – só após 7 dias da confirmação (dataConclusao)
    const diasDesdeConclusao =
      (Date.now() - new Date(entrega.dataConclusao).getTime()) / 86400000;
    if (diasDesdeConclusao < DIAS_MINIMOS_PARA_AVALIAR) {
      const faltam = Math.ceil(DIAS_MINIMOS_PARA_AVALIAR - diasDesdeConclusao);
      throw new Error(
        `RN02 – A avaliação só é permitida após ${DIAS_MINIMOS_PARA_AVALIAR} dias da ` +
          `confirmação da entrega. Ainda faltam ~${faltam} dia(s).`
      );
    }

    // 1 avaliação por pedido
    const jaExiste = await Avaliacao.count({ where: { pedidoId }, transaction });
    if (jaExiste > 0) {
      throw new Error("Este pedido já possui uma avaliação.");
    }

    const avaliacao = await Avaliacao.create(
      { clienteId, pedidoId, notaComida, notaEntrega, comentario: comentario ?? null },
      { transaction }
    );

    // Atualiza contagem e aplica RN01
    if (entrega.entregadorId) {
      await Entregador.increment("totalAvaliacoes", {
        by: 1,
        where: { id: entrega.entregadorId },
        transaction,
      });
      await verificarDesligamentoEntregador(entrega.entregadorId, transaction);
    }

    await transaction.commit();
    return avaliacao;
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    throw error;
  }
}

/**
 * RF42 + RNF01 – Atualizar avaliação (apenas o comentário).
 */
async function atualizar(id, { notaComida, notaEntrega, comentario }) {
  if (notaComida !== undefined || notaEntrega !== undefined) {
    throw new Error(
      "RNF01 – As notas não podem ser alteradas após a submissão da avaliação."
    );
  }
  const avaliacao = await Avaliacao.findByPk(id);
  if (!avaliacao) throw new Error("Avaliação não encontrada.");
  await avaliacao.update({ comentario });
  return avaliacao;
}

/**
 * RF43 – Remover avaliação (somente admin/gerente).
 */
async function remover(id) {
  const avaliacao = await Avaliacao.findByPk(id);
  if (!avaliacao) throw new Error("Avaliação não encontrada.");
  await avaliacao.destroy();
}

/**
 * RF44 – Buscar avaliação por ID.
 */
async function buscarPorId(id) {
  const avaliacao = await Avaliacao.findByPk(id, {
    include: [
      { association: "pedido" },
      { association: "cliente", attributes: { exclude: ["senha"] } },
    ],
  });
  if (!avaliacao) throw new Error("Avaliação não encontrada.");
  return avaliacao;
}

/**
 * RF51 – Listar avaliações (data decrescente).
 */
async function listar() {
  return Avaliacao.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        association: "pedido",
        include: [
          {
            association: "entrega",
            include: [
              { association: "entregador", attributes: { exclude: ["senha"] } },
            ],
          },
        ],
      },
      { association: "cliente", attributes: { exclude: ["senha"] } },
    ],
  });
}

module.exports = { avaliar, buscarPorId, listar, atualizar, remover };
