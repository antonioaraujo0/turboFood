/**
 * AvaliacaoService.js
 *
 * Todas as regras de negócio são validadas via transações no banco de dados.
 *
 * RF01  – Avaliação só disponível após confirmação da entrega
 * RF02  – Nota de 1 a 5 para comida e entrega
 * RF03  – Comentário opcional em texto
 * RNF01 – Notas imutáveis após submissão
 * RNF02 – Disponível 24/7
 * RN01  – Após 50 entregas, entregador com média < 2 é desligado
 * RN02  – Avaliação só aceita até 7 dias após conclusão da entrega
 */

const { QueryTypes } = require('sequelize');
const { sequelize, Avaliacao, Pedido, Entrega, Entregador } = require('../models');

// ─── RN02 ─────────────────────────────────────────────────────────────────────
/**
 * Valida se o pedido foi entregue e se a entrega foi concluída há no máximo 7 dias.
 * A diferença de dias é calculada diretamente pelo motor do banco.
 * Retorna o registro da entrega se válido, ou null se fora do prazo / não entregue.
 */
async function validarPrazoAvaliacao(pedidoId, transaction) {
  const [entrega] = await sequelize.query(
    `SELECT e.id, e.entregadorId
     FROM Entregas e
     INNER JOIN Pedidos p ON p.id = e.pedidoId
     WHERE p.id = :pedidoId
       AND e.status = 'ENTREGUE'
       AND e.dataConclusao IS NOT NULL
       AND CAST((julianday('now') - julianday(e.dataConclusao)) AS INTEGER) <= 7`,
    {
      replacements: { pedidoId },
      type: QueryTypes.SELECT,
      transaction,
    }
  );

  return entrega ?? null;
}

// ─── RN01 ─────────────────────────────────────────────────────────────────────
/**
 * Após inserir a avaliação, verifica dentro da mesma transação:
 *  1. Se o entregador tem pelo menos 50 entregas concluídas.
 *  2. Se a média de notaEntrega das avaliações dele é menor que 2.
 * Se ambas as condições forem verdadeiras, atualiza ativo = false no banco.
 */
async function verificarDesligamentoEntregador(entregadorId, transaction) {
  // Passo 1 — Contagem de entregas concluídas
  const [{ totalEntregas }] = await sequelize.query(
    `SELECT COUNT(e.id) AS totalEntregas
     FROM Entregas e
     WHERE e.entregadorId = :entregadorId
       AND e.status = 'ENTREGUE'`,
    {
      replacements: { entregadorId },
      type: QueryTypes.SELECT,
      transaction,
    }
  );

  if (parseInt(totalEntregas) < 50) return; // Ainda não atingiu o mínimo para corte

  // Passo 2 — Média de notaEntrega vinculada a esse entregador
  const [{ mediaNota }] = await sequelize.query(
    `SELECT AVG(av.notaEntrega) AS mediaNota
     FROM Avaliacoes av
     INNER JOIN Pedidos p  ON p.id  = av.pedidoId
     INNER JOIN Entregas e ON e.pedidoId = p.id
     WHERE e.entregadorId = :entregadorId
       AND e.status = 'ENTREGUE'`,
    {
      replacements: { entregadorId },
      type: QueryTypes.SELECT,
      transaction,
    }
  );

  // Passo 3 — Se média < 2, desliga o entregador no banco
  if (parseFloat(mediaNota) < 2.0) {
    await sequelize.query(
      `UPDATE Entregadores
       SET ativo = 0
       WHERE id = :entregadorId`,
      {
        replacements: { entregadorId },
        type: QueryTypes.UPDATE,
        transaction,
      }
    );

    console.warn(
      `[RN01] Entregador ID ${entregadorId} desligado automaticamente. ` +
      `Média: ${parseFloat(mediaNota).toFixed(2)} | Entregas: ${totalEntregas}`
    );
  }
}

// ─── Casos de Uso ─────────────────────────────────────────────────────────────

/**
 * RF01 + RF02 + RF03 + RN01 + RN02 – Criar avaliação.
 *
 * Fluxo da transação:
 *  1. BEGIN TRANSACTION
 *  2. RN02 – Query cruzando Pedido + Entrega com diferença de dias <= 7 no banco
 *     → vazio:      ROLLBACK + erro "prazo expirado ou entrega não concluída"
 *     → encontrado: continua
 *  3. Verifica duplicidade (1 avaliação por pedido)
 *     → já existe:  ROLLBACK + erro
 *  4. INSERT na tabela Avaliacoes
 *  5. RN01 – Verifica contagem e média do entregador, UPDATE se necessário
 *  6. COMMIT
 */
async function avaliar({ clienteId, pedidoId, notaComida, notaEntrega, comentario }) {
  const transaction = await sequelize.transaction();

  try {
    // RF01 + RN02 — Validação cruzada diretamente no banco
    const entrega = await validarPrazoAvaliacao(pedidoId, transaction);

    if (!entrega) {
      await transaction.rollback();
      throw new Error(
        'RN02 – O prazo de 7 dias para avaliar este pedido expirou, ' +
        'ou a entrega ainda não foi concluída (RF01).'
      );
    }

    // Garante 1 avaliação por pedido
    const [{ total }] = await sequelize.query(
      `SELECT COUNT(id) AS total FROM Avaliacoes WHERE pedidoId = :pedidoId`,
      {
        replacements: { pedidoId },
        type: QueryTypes.SELECT,
        transaction,
      }
    );

    if (parseInt(total) > 0) {
      await transaction.rollback();
      throw new Error('Este pedido já possui uma avaliação.');
    }

    // INSERT da avaliação
    const avaliacao = await Avaliacao.create(
      { clienteId, pedidoId, notaComida, notaEntrega, comentario: comentario ?? null },
      { transaction }
    );

    // RN01 — Dentro da mesma transação, após o INSERT
    if (entrega.entregadorId) {
      await verificarDesligamentoEntregador(entrega.entregadorId, transaction);
    }

    await transaction.commit();
    return avaliacao;

  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
}

/**
 * RF42 + RNF01 – Atualizar avaliação.
 * Apenas o comentário pode ser alterado após submissão.
 */
async function atualizar(id, { notaComida, notaEntrega, comentario }) {
  // RNF01 — Bloqueio antes de abrir qualquer transação
  if (notaComida !== undefined || notaEntrega !== undefined) {
    throw new Error(
      'RNF01 – As notas não podem ser alteradas após a submissão da avaliação.'
    );
  }

  const transaction = await sequelize.transaction();

  try {
    const [, metadata] = await sequelize.query(
      `UPDATE Avaliacoes SET comentario = :comentario WHERE id = :id`,
      {
        replacements: { comentario, id },
        type: QueryTypes.UPDATE,
        transaction,
      }
    );

    if (metadata === 0) {
      await transaction.rollback();
      throw new Error('Avaliação não encontrada.');
    }

    await transaction.commit();
    return Avaliacao.findByPk(id);

  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    throw error;
  }
}

/**
 * RF43 – Remover avaliação (somente admin/gerente).
 */
async function remover(id) {
  const transaction = await sequelize.transaction();

  try {
    await sequelize.query(
      `DELETE FROM Avaliacoes WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.DELETE,
        transaction,
      }
    );

    await transaction.commit();

  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    throw error;
  }
}

/**
 * RF44 – Buscar avaliação por ID.
 */
async function buscarPorId(id) {
  const avaliacao = await Avaliacao.findByPk(id, {
    include: [
      { association: 'pedido' },
      { association: 'cliente', attributes: { exclude: ['senha'] } },
    ],
  });

  if (!avaliacao) throw new Error('Avaliação não encontrada.');
  return avaliacao;
}

/**
 * RF51 – Listar avaliações (ordem decrescente).
 * RNF02 – Disponível 24/7, sem restrição de horário do restaurante.
 */
async function listar() {
  return Avaliacao.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      {
        association: 'pedido',
        include: [
          {
            association: 'entrega',
            include: [{ association: 'entregador', attributes: { exclude: ['senha'] } }],
          },
        ],
      },
      { association: 'cliente', attributes: { exclude: ['senha'] } },
    ],
  });
}

module.exports = { avaliar, buscarPorId, listar, atualizar, remover };
